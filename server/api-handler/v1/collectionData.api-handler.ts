import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, CollectionDataInterface, CollectionDataProcess} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {BatchDelete, BatchSet, BatchUpdate, GetInfoDB, GetParameter} from "../../../utils/firebase.util";
import {FirestoreGlobalLocation, FirestoreParameters} from "../../../enums/firebase.enum";
import {
  CalculateChance,
  CalculateFactor,
  FindAndReadjustFeatureIndexes,
  GetMaxCombinationNum,
  GetMaxIndexValues,
  GetMultiplyNums,
  IndexValuesStringToNumber,
  IndexValuesToString,
  NumberToIndexValues
} from "../../../utils/collection.util";
import {LogError} from "../../../utils/common.util";
import {CampaignParameterName, Module, RandomTier} from "../../../enums/common.enum";
import {GLOBAL_VALUES} from "../../../constants/common.constant";
import {CollectionItem, CollectionPostBody} from "../../interfaces/collection.interface";
import {
  CreateProcess,
  GenerateProcessId,
  GetProcess,
  SetProcessDone,
  SetProcessError
} from "../../utils/side-process.util";
import {CollectionStatus} from "../../enums/collection.enum";
import {COLLECTION_VALUES} from "../../constants/collection.constant";

export async function GetUriApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<CollectionDataInterface>>) {
  const {collection} = req.query;
  const [campaign] = collection as string[];
  
  try {
    // On campaign not exist return bad request
    const isCampaign = await CheckCampaign(campaign);
    if (!isCampaign)
      return RequestResponse(res, "BadRequest", false, DefaultApiResponse.WrongInput);

    // Update index on campaign
    const featureValues = await FindAndReadjustFeatureIndexes(campaign);
    if (featureValues == undefined)
      return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
    
    const maxIndexValues = GetMaxIndexValues(featureValues.featureList, featureValues.featureOptionListData);
    const maxCombination = GetMaxCombinationNum(maxIndexValues);

    const collectionData: CollectionDataInterface = {
      maxCombination: maxCombination,
      maxIndex: Array.from(maxIndexValues.values()).join(GLOBAL_VALUES.CollectorIndexSeparator),
      featureIndex: featureValues.featureList.map(f => { return { index: f.index, name: f.displayName }})
    };

    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, collectionData);
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, err.message, e);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}

async function CheckCampaign(campaign: string | undefined) {
  if (campaign == undefined) return false;
  
  const campaignsResult = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  return campaignsResult.success ? campaignsResult.value.some(c => c === campaign) : false;
}

async function ProcessCollection(campaign: string, update: boolean, processId: string) {
  const collectionRoute = `${FirestoreGlobalLocation.Collection}/${campaign}/${COLLECTION_VALUES.Suffix}`;
  // Check existence of collection
  const collectionItemsResult = await GetInfoDB<CollectionItem>(collectionRoute);
  
  if (!collectionItemsResult.success)
    return await SetProcessError(processId, "Error getting collection item list");
  
  const collectionItems = collectionItemsResult.value;
  
  // If it exists, has something and update flag is false don't do anything
  if (collectionItems.length > 0 && !update)
    return await SetProcessDone(processId);

  // Update index on campaign
  const featureValues = await FindAndReadjustFeatureIndexes(campaign);
  if (featureValues == undefined)
    return await SetProcessError(processId, "Error readjusting feature indexes");

  const maxIndexValues = GetMaxIndexValues(featureValues.featureList, featureValues.featureOptionListData);
  const maxCombination = GetMaxCombinationNum(maxIndexValues);

  // Count the amount of docs
  // If same amount of maxCombination, all good
  if (collectionItems.length === maxCombination + 1)
    return await SetProcessDone(processId);

  const multNums = GetMultiplyNums(maxIndexValues);
  if (multNums == undefined)
    return await SetProcessError(processId, "Error generating multiply numbers");

  // If different? update the existence
  // Separate the minted ones from the others
  const minted: Map<number, CollectionItem> = new Map();
  const mappedItems: Map<number, CollectionItem> = new Map();
  
  for (let i = 0; i < collectionItems.length; i++) {
    const item = collectionItems[i];

    mappedItems.set(item.id, item);
    if (item.status === CollectionStatus.Minted)
      minted.set(item.id, item);
  }
  
  const needMintedKeys: (string | number)[] = [];

  // If minted ones, recalculate based on the index-values and update the minted state
  if (minted.size !== 0) {
    for (const [key, item] of minted) {
      const newKey = IndexValuesStringToNumber(item.indexValues, maxIndexValues, multNums);
      if (newKey == undefined) continue;
      
      if (newKey != key) {
        const exists = mappedItems.get(newKey);
        if (exists != undefined) {
          exists.status = CollectionStatus.Minted;
          item.status = CollectionStatus.NotMinted;
        } else {
          needMintedKeys.push(newKey);
        }
      }
    }
  }

  const optionTier: Map<number, Map<number, RandomTier | undefined>> = new Map();
  for (const [feature, optionList] of Array.from(featureValues.featureOptionListData.values()).entries()) {
    const mappedList = new Map(optionList.map(item => [item.index, item.tier]));
    optionTier.set(feature, mappedList);
  }
  
  const tierChance = await GetParameter<Record<RandomTier, number>>(campaign, CampaignParameterName.Random);
  const forCreation: CollectionItem[] = [];
  const forUpdate: [(string | number), Partial<CollectionItem>][] = [];
  const forDelete: (string | number)[] = [];

  if (collectionItems.length === 0)
    forCreation.push({
      id: -1,
      factor: CalculateFactor(maxIndexValues.size, maxCombination, tierChance),
      status: CollectionStatus.NotMinted
    });
  
  for (let i = 0; i < maxCombination; i++) {
    const item = mappedItems.get(i);
    const indexValues = NumberToIndexValues(i, maxCombination, maxIndexValues, multNums);
    if (indexValues == undefined) continue;
    
    const ivString = IndexValuesToString(indexValues);
    const calculatedChance = CalculateChance(indexValues, tierChance, optionTier, maxCombination);

    // If non-existent create new item
    if (item == undefined) {
      forCreation.push({
        id: i,
        status: needMintedKeys.some(x => x === i) ? CollectionStatus.Minted : CollectionStatus.NotMinted,
        indexValues: ivString,
        chance: calculatedChance,
      });
    }
    else {
      forUpdate.push([i, {
        status: item.status,
        indexValues: ivString,
        chance: calculatedChance,
      }]);
    }
  }

  if (mappedItems.size > maxCombination) {
    const outOfBounds = [...mappedItems.keys()].filter(x => x > maxCombination);
    for (const outKey of outOfBounds) {
      forDelete.push(outKey);
    }
  }
  
  const setResult = await BatchSet(collectionRoute, forCreation);
  if (!setResult.success)
    return await SetProcessError(processId, setResult.errMessage);
  
  const updateResult = await BatchUpdate(collectionRoute, forUpdate);
  if (!updateResult.success)
    return await SetProcessError(processId, updateResult.errMessage);
  
  const deleteResult = await BatchDelete(collectionRoute, forDelete);
  if (!deleteResult.success)
    return await SetProcessError(processId, deleteResult.errMessage);
  
  // When done, fill on db the status and tell is done
  // Create something that controls this status
  return await SetProcessDone(processId);
}

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<CollectionDataProcess>>) {
  const {isUpdate, campaign} = req.body as CollectionPostBody;
  
  try {
    const isCampaign = await CheckCampaign(campaign);
    if (!isCampaign)
      return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
    
    const processId = await GenerateProcessId();
    
    void CreateProcess(processId, campaign!, String(!!isUpdate));
    void ProcessCollection(campaign!, !!isUpdate, processId);
    
    const processStatus = await GetProcess(processId);
    const collectionData: CollectionDataProcess = {
      id: processId,
      done: processStatus.success ? processStatus.value.done : false,
    };
    return RequestResponse(res, "Successful", true, DefaultApiResponse.Processing, collectionData);
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, err.message, e);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}

// Util on LuksoBackend
// Allow to update this combination status to minted when a mint happens
// that way we keep track of minted combinations and won't show any combination that is already taken