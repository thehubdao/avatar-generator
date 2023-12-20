import {GetParameter, UpdateDocObject} from "./firebase.util";
import {FirestoreLocation} from "../enums/firebase.enum";
import {FeatureInterface} from "../interfaces/api.interface";
import {
  CastStringToInteger,
  LogError,
  ObjectEntries,
  RandomArrayElement,
  RandomIntMax,
  SetMapToMap
} from "./common.util";
import {CampaignParameterName, CommonErrorCode, Module, RandomTier} from "../enums/common.enum";
import {FeatureBasic} from "../interfaces/common.interface";
import {GetData} from "../server/api-handler/v1/featureOptions.api-handler";
import {GLOBAL_VALUES} from "../constants/common.constant";
import {Result} from "../types/common.type";
import {IndexValues} from "../types/collection.type";

export async function FindAndReadjustFeatureIndexes(campaign: string) {
  // Get FeatureList (same from page)
  const featuresResult = await GetParameter<FeatureBasic[]>(campaign, CampaignParameterName.Features);
  if (!featuresResult.success)
    return void LogError(Module.CollectionUtil, `Couldn't find featureList for campaign: ${campaign}`);
  
  featuresResult.value.sort((a, b) => a.index - b.index);
  
  // Get FeatureOptionListData
  const featureOptionListData: Map<number, FeatureInterface[]> = new Map();
  const featureData = await GetData(campaign);
  if (!featureData.success)
    return void LogError(Module.CollectionUtil, "Could not retrieve feature option data!");

  for (const feature of featuresResult.value) {
    if (feature.index == undefined) {
      void LogError(Module.CollectionUtil, `Missing index on ${feature.displayName} feature type!`);
      continue;
    }

    featureOptionListData.set(feature.index, featureData.value.filter(f => f.type === feature.displayName));
  }

  const featureOptionsToUpdate: Map<string, FeatureInterface> = new Map();
  // Process every single one like in the for
  for (const feature of featuresResult.value) {
    const featureOptionList = featureOptionListData.get(feature.index);
    if (featureOptionList == undefined) continue;

    // Change the function to UpdateNewIndexes
    const toUpdate = UpdateNewIndexes(featureOptionList);
    // Save the return optionListToUpdate
    SetMapToMap(featureOptionsToUpdate, toUpdate);
  }
  
  // Update all at the same time
  await UpdateNewIndexesOnDB(campaign, featureOptionsToUpdate);
  // Return the FeatureOptionListData with the new values
  return {featureList: featuresResult.value, featureOptionListData};
}

export async function ReadjustFeatureIndexes(featureList: FeatureInterface[] | undefined, campaign: string) {
  if (featureList == undefined)
    return LogError(Module.CollectionComponent, "Missing feature option list!");
  
  const featureOptionsToUpdate = UpdateNewIndexes(featureList);
  await UpdateNewIndexesOnDB(campaign, featureOptionsToUpdate);
}

function UpdateNewIndexes(featureList: FeatureInterface[]) {
  const featureOptionToUpdate: Map<string, FeatureInterface> = new Map();
  
  // Order list by index (is numeric)
  const orderedList = featureList
    .filter(opt => opt.index != undefined)
    .sort((a, b) => a.index - b.index);

  // Have list of items without index
  const missingIndexList = featureList.filter(opt => opt.index == undefined);

  // Start iterating 1 by 1
  for (let i = 0; i < featureList.length; i++) {
    if (orderedList.some(f => f.index === i)) {
      orderedList.splice(orderedList.findIndex(f => f.index === i), 1);
      continue;
    }

    if (missingIndexList.length > 0) {
      const toSetIndex = missingIndexList.pop();
      if (toSetIndex == undefined) { i--; break; }

      const toUpdate = featureList.find(opt => opt.id === toSetIndex.id);
      if (toUpdate == undefined) { i--; break; }
      toUpdate.index = i;
      featureOptionToUpdate.set(toUpdate.id, toUpdate);
    } else if (orderedList.length > 0) {
      orderedList.forEach(opt => opt.index = opt.index - 1);
      i--;
    }
  }
  
  return featureOptionToUpdate;
}

async function UpdateNewIndexesOnDB(campaign: string, featureOptionToUpdate: Map<string, FeatureInterface>) {
  const updatePromises: Promise<unknown>[] = [];

  for (const [key, toUpdate] of featureOptionToUpdate) {
    updatePromises.push(UpdateDocObject(FirestoreLocation.Features, toUpdate, campaign, key));
  }

  await Promise.all(updatePromises);
}

export function IndexValuesToNumber(indexValues: Map<number, number> | undefined, maxValues: Map<number, number>, multiplyNums?: number[]) {
  if (indexValues == undefined)
    return void LogError(Module.CollectionUtil, "No indexValues to work on!");

  if (indexValues.size !== maxValues.size)
    return void LogError(Module.CollectionUtil, "Error parsing indexValues to number, out of range!");

  if (multiplyNums == undefined)
    multiplyNums = GetMultiplyNums(maxValues);
  
  const multNums = multiplyNums;
  if (multNums == undefined)
    return void LogError(Module.CollectionUtil, "Error getting misshaped values for multiply nums!");

  let result = 0;
  for (const [i, val] of Array.from(maxValues.values()).entries()) {    
    const indexVal = indexValues.get(i) ?? 0;
    if (indexVal >= val)
      return void LogError(Module.CollectionUtil, "Error index values higher than maximum values!");
      
    const newVal = indexVal * multNums[i + 1];

    result += newVal;
  }
  
  return result;
}

export function IndexValuesStringToNumber(indexValuesString: string | undefined, maxValues: Map<number, number>, multiplyNums?: number[]) {
    if (indexValuesString == undefined)
      return void LogError(Module.CollectionComponent, "No indexValues to work on!");
    
    const realIndexValues = StringToIndexValues(indexValuesString, maxValues);
    return IndexValuesToNumber(realIndexValues, maxValues, multiplyNums);
}

export function StringToIndexValues(input: string, maxValues: Map<number, number>) {
  const inputArray = input.split(GLOBAL_VALUES.CollectorIndexSeparator);  
  const result: Map<number, number> = new Map();
  
  for (const [key, value] of inputArray.entries()) {
    const realValue = CastStringToInteger(value);
    if (realValue != undefined)
      result.set(key, realValue);
  }
  
  if (!IsValidIndexValues(result, maxValues)) return undefined;
  return result;
}

export function IsValidIndexValues(indexValues: Map<number, number>, maxValues: Map<number, number>) {
  if (indexValues.size === 0) {
    void LogError(Module.CommonUtil, "Empty index values, not valid!");
    return false;
  }
  
  if (indexValues.size !== maxValues.size) {
    void LogError(Module.CommonUtil, "Misshaped index values, not valid!");
    return false;
  }
  
  for (const [key, value] of indexValues) {
    const maxVal = maxValues.get(key); 
    if (maxVal !== undefined && value >= 0 && value < maxVal) continue;

    void LogError(Module.CommonUtil, "IndexValues out of bounds, not valid!");
    return false;
  }
  
  return true;
}

export function NumberToIndexValues(num: number, maxCombination: number, maxValues: Map<number, number>, multiplyNums?: number[]) {
  if (num < 0 || num > maxCombination)
    return void LogError(Module.CollectionComponent, "Number out of range!");

  const multNums = multiplyNums ?? GetMultiplyNums(maxValues);
  if (multNums == undefined)
    return void LogError(Module.CollectionComponent, "Error getting misshaped values for multiply nums!");

  const result = new Map<number, number>();
  let currentValue = num;
  let i = 0;

  for (const key of maxValues.keys()) {
    const newIndexValue = (currentValue / multNums[i + 1]) | 0;
    currentValue -= newIndexValue * multNums[i + 1];
    result.set(key, newIndexValue);
    i++;
  }

  return result;
}

export function GetMultiplyNums(maxValues: Map<number, number>) {
  const multNums: number[] = [];
  for (let i = maxValues.size - 1; i > 0; i--) {
    const multi = multNums[i + 1] ?? 1;
    const val = maxValues.get(i);
    if (val == undefined) return undefined;

    const currentMaxValue = val === 0 ? 1 : val; 
    multNums[i] = multi * currentMaxValue;
  }
  multNums[maxValues.size] = 1;
  
  return multNums;
}

export function GetMaxIndexValues(featureList: FeatureBasic[], featureOptionListData: Map<number, FeatureInterface[] | undefined>) {
  const maxIndexValues: Map<number, number> = new Map();
  for (let i = 0; i < featureList.length; i++) {
    const currentFeature = featureList[i];
    const optionList = featureOptionListData.get(currentFeature.index);
    if (optionList != undefined)
      maxIndexValues.set(i, optionList.length);
  }
  
  return maxIndexValues;
}

export function GetMinIndexValues(size: number) {
  const minIndexValues: Map<number, number> = new Map();
  for (let i = 0; i < size; i++) {
    minIndexValues.set(i, 0);
  }
  
  return minIndexValues;
}

export function GetMaxCombinationNum(maxIndexValues: Map<number, number>) {
  let result = 1;

  for (const value of maxIndexValues.values()) {
    result *= value !== 0 ? value : 1;
  }
  
  return result;
}

export function IndexValuesToString(indexValues: Map<number, number> | undefined) {
  let result = '';

  if (indexValues != undefined) {
    for (let i = 0; i < indexValues.size; i++) {
      const value = indexValues.get(i);
      result += `-${value ?? ''}`;
    }
    result = result.substring(1);
  }

  return result;
}

export function GetCombinationValues(combinationIndexValues: Map<number, number>, featureOptionListData: Map<number, FeatureInterface[] | undefined>) {
  const featureCombination: {index: number, val: FeatureInterface}[] = [];
  for (const [key, val] of Array.from(featureOptionListData.values()).entries()) {
    const feature = val?.find(f => f.index === combinationIndexValues.get(key));
    if (feature != undefined)
      featureCombination.push({index: key, val: feature});
  }
  
  return featureCombination;
}

function GetWinnerTeam(maxIndexValues: Map<number, number>, rVal: Result<Record<RandomTier, number>>): RandomTier[] | false {
  if (!rVal.success) return false;
  if (Object.keys(rVal.value).length !== Object.keys(RandomTier).length) return false;
  
  const values = Object.values(rVal.value);
  let sum = 0;
  values.forEach(v => sum += v);
  if (sum !== 100) return false;

  const acc: [RandomTier, number][] = [];
  for (const [key, v] of ObjectEntries(rVal.value)) {
    if (acc.length === 0)
      acc.push([key, v / 100]);
    else
      acc.push([key, (v / 100) + acc[acc.length - 1][1]]);
  }
  
  const winnerTeam: RandomTier[] = [];
  for (let i = 0; i < maxIndexValues.size; i++) {
    const rand = Math.random();
    const tier = acc.find(([, a]) => rand <= a);
    if (tier !== undefined)
      winnerTeam.push(tier[0]);
  }
  
  if (winnerTeam.length !== maxIndexValues.size) return false;
  
  return winnerTeam;
}

export function RandomIndexValues(maxIndexValues: Map<number, number>, rVal: Result<Record<RandomTier, number>>, optionList: Map<number, FeatureInterface[]>): Map<number, number> {
  const winnerTeam = GetWinnerTeam(maxIndexValues, rVal);
  const randomIndexValues: Map<number, number> = new Map();
  
  if (winnerTeam !== false) {
    // use winnerTeam
    for (const [index, featureArray] of Array.from(optionList.values()).entries()) {
      const winnerTier = winnerTeam[index];
      let filteredArray = featureArray.filter(f => f.tier === winnerTier);
      if (filteredArray.length === 0 && winnerTier !== RandomTier.Common)
        filteredArray = featureArray.filter(f => f.tier === RandomTier.Common);
      if (filteredArray.length === 0)
        filteredArray = featureArray;
      
      const randomFeature = RandomArrayElement(filteredArray);
      randomIndexValues.set(index, randomFeature.index);
    }
  }
  else {
    for (const [index, val] of maxIndexValues) {
      // Generate random based on maxIndexValues
      const randomNum = RandomIntMax(val);
      randomIndexValues.set(index, randomNum);
    }
  }
  
  return randomIndexValues;
}

export function NextIteration(current: IndexValues, start: IndexValues, end: IndexValues) {
  const clone = new Map(current);
  return LowerIteration(clone, current.size - 1, end);
}

function LowerIteration(currentIteration: IndexValues, index: number, end: IndexValues): Result<IndexValues> {
  if (index < 0) return {success: true, value: currentIteration};

  const current = currentIteration.get(index);
  const max = end.get(index);

  if (current == undefined || max == undefined)
    return {success: false, errMessage: "Missing current and max index values!", errCode: CommonErrorCode.MissingInfo};

  if (current < max) {
    currentIteration.set(index, current + 1);
    return {success: true, value: currentIteration};
  } else {
    currentIteration.set(index, 0);
    return LowerIteration(currentIteration, index - 1, end);
  }
}

export function CalculateChance(current: IndexValues, tierChance: Result<Record<RandomTier, number>>, options: Map<number, Map<number, RandomTier | undefined>>, maxCombination: number): number {
  // if no tierChance same chance for all options
  if (!tierChance.success) return 1 / maxCombination;
  
  let chance = 1;
  for (const [feature, optionList] of options) {
    const iV = current.get(feature);
    if (iV == undefined) continue;
    const optionTier = optionList.get(iV) ?? RandomTier.Common;
    const tierValue = tierChance.value[optionTier] / 100;
    
    chance *= tierValue;
  }
  
  return chance;
}

export function CalculateFactor(iVSize: number, maxAmount: number, tierChance: Result<Record<RandomTier, number>>) {
  return (tierChance.success ?
    Math.pow(tierChance.value[RandomTier.Common] / 100, iVSize) :
    1 / maxAmount) * 3;
}