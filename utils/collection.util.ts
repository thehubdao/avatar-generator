import {GetParameter, UpdateDocObject} from "./firebase.util";
import {FirestoreLocation} from "../enums/firebase.enum";
import {FeatureInterface} from "../interfaces/api.interface";
import {CastStringToInteger, LogError, SetMapToMap} from "./common.util";
import {CampaignParameterName, GlobalValues, Module} from "../enums/common.enum";
import {FeatureBasic} from "../interfaces/common.interface";
import {GetData} from "../server/api-handler/v1/featureOptions.api-handler";

export async function FindAndReadjustFeatureIndexes(campaign: string) {
  // Get FeatureList (same from page)
  const featureList = await GetParameter<FeatureBasic[]>(campaign, CampaignParameterName.Features);
  if (featureList == undefined)
    return void LogError(Module.CollectionUtil, `Couldn't find featureList for campaign: ${campaign}`);
  
  // Get FeatureOptionListData
  const featureOptionListData: Map<number, FeatureInterface[] | undefined> = new Map();
  const featureData = await GetData(campaign);
  // if (!featureData.success)
  //   return void LogError(Module.CollectionUtil, "Could not retrieve feature option data!");

  for (const feature of featureList) {
    if (feature.index == undefined) {
      void LogError(Module.CollectionUtil, `Missing index on ${feature.meshName} feature type!`);
      continue;
    }

    featureOptionListData.set(feature.index, featureData.filter(f => f.type === feature.meshName));
  }

  const featureOptionsToUpdate: Map<string, FeatureInterface> = new Map();
  // Process every single one like in the for
  for (const feature of featureList) {
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
  return {featureList, featureOptionListData};
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
  for (let i = 0; i < maxValues.size; i++) {
    const indexVal = indexValues.get(i) ?? 0;
    if (indexVal >= (maxValues.get(i) ?? 0))
      return void LogError(Module.CollectionUtil, "Error index values higher than maximum values!");
      
    const newVal = indexVal * multNums[i + 1];

    result += newVal;
  }

  return result;
}

export function IndexValuesStringToNumber(indexValuesString: string | undefined, maxValues: Map<number, number>, multiplyNums?: number[]) {
    if (indexValuesString == undefined)
      return void LogError(Module.CollectionComponent, "No indexValues to work on!");
    
    const realIndexValues = StringToIndexValues(indexValuesString);
    return IndexValuesToNumber(realIndexValues, maxValues, multiplyNums);
}

export function StringToIndexValues(input: string) {
  const inputArray = input.split(GlobalValues.CollectorIndexSeparator);  
  const result: Map<number, number> = new Map();
  
  for (const [key, value] of inputArray.entries()) {
    const realValue = CastStringToInteger(value);
    if (realValue != undefined)
      result.set(key, realValue);
  }
  
  return result;
}

export function NumberToIndexValues(num: number, maxCombination: number, maxValues: Map<number, number>, multiplyNums?: number[]) {
  if (num < 0 || num > maxCombination)
    return void LogError(Module.CollectionComponent, "Number out of range!");

  const multNums = multiplyNums ?? GetMultiplyNums(maxValues);
  if (multNums == undefined)
    return void LogError(Module.CollectionComponent, "Error getting misshaped values for multiply nums!");

  const result = new Map<number, number>();
  let currentValue = num;

  for (let i = 0; i < maxValues.size; i++) {
    const newIndexValue = (currentValue / multNums[i + 1]) | 0;
    currentValue -= newIndexValue * multNums[i + 1];
    result.set(i, newIndexValue);
  }

  return result;
}

function GetMultiplyNums(maxValues: Map<number, number>) {
  const multNums: number[] = [];
  for (let i = maxValues.size - 1; i > 0; i--) {
    const multi = multNums[i + 1] ?? 1;
    const val = maxValues.get(i);
    // console.log('Iter: ', i, multi, val);

    if (val == undefined) return undefined;

    multNums[i] = val * multi;
  }
  multNums[maxValues.size] = 1;
  
  return multNums;
}

export function GetMaxIndexValues(featureList: FeatureBasic[], featureOptionListData: Map<number, FeatureInterface[] | undefined>) {
  const maxIndexValues: Map<number, number> = new Map();
  for (const feature of featureList) {
    const optionList = featureOptionListData.get(feature.index);
    if (optionList != undefined)
      maxIndexValues.set(feature.index, optionList.length);
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

  for (let i = 0; i < maxIndexValues.size; i++) {
    const value = maxIndexValues.get(i);
    result *= value ?? 1;
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
  for (const [key, value] of combinationIndexValues) {
    const feature = featureOptionListData.get(key)?.find(f => f.index === value);
    if (feature != undefined)
      featureCombination.push({index: key, val: feature});
  }
  
  return featureCombination;
}