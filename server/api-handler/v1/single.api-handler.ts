import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, SingleInterface} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {GetParameter} from "../../../utils/firebase.util";
import {FirestoreParameters} from "../../../enums/firebase.enum";
import {
  FindAndReadjustFeatureIndexes,
  GetCombinationValues,
  GetMaxCombinationNum,
  GetMaxIndexValues,
  IndexValuesStringToNumber,
  NumberToIndexValues, RandomIndexValues, StringToIndexValues
} from "../../../utils/collection.util";
import {Base64ToObj, CastStringToInteger, LogError, Raise} from "../../../utils/common.util";
import {EXPORT_ATTRIBUTE, GLOBAL_VALUES} from "../../../constants/common.constant";
import {SinglePostBody} from "../../interfaces/single.interface";
import {BasicData} from "../../../interfaces/common.interface";
import {CampaignParameterName, Module, RandomTier} from "../../../enums/common.enum";

async function CheckCampaign(campaign: string) {
  const campaignsResult = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  return campaignsResult.success ? campaignsResult.value.some(c => c === campaign) : false;
}

function ProcessCombination(combination: string | undefined, maxValues: Map<number, number>) {
  if (combination == undefined) return;
  
  if (combination.includes(GLOBAL_VALUES.CollectorIndexSeparator))
    return StringToIndexValues(combination, maxValues);
  
  return CastStringToInteger(combination);
}

async function ProcessAndGetData(res: NextApiResponse<ApiResponse<SingleInterface>>, campaign: string, combination: string | undefined) {
  // On campaign not exist return bad request
  const isCampaign = await CheckCampaign(campaign);
  if (!isCampaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.WrongInput);

  // Update index on campaign
  const featureValues = await FindAndReadjustFeatureIndexes(campaign);
  if (featureValues == undefined)
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);

  // On invalid number use random combination
  const maxIndexValues = GetMaxIndexValues(featureValues.featureList, featureValues.featureOptionListData);
  const maxCombination = GetMaxCombinationNum(maxIndexValues);
  let combinationNum = ProcessCombination(combination, maxIndexValues);
  let isRandom = false;

  const randomBalance = await GetParameter<Record<RandomTier, number>>(campaign, CampaignParameterName.Random);
  
  // Collection util
  // If combination is out of bounds throw error
  if (typeof combinationNum === 'number' && (combinationNum < 0 || combinationNum > maxCombination)) {
    // Error
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.WrongInput);
  } else if (combinationNum == undefined) {
    // random
    isRandom = true;
    combinationNum = RandomIndexValues(maxIndexValues, randomBalance, featureValues.featureOptionListData);
  }

  // Try get combination
  const combinationIndexValues = typeof combinationNum === 'number' ? NumberToIndexValues(combinationNum, maxCombination, maxIndexValues) : combinationNum;
  if (combinationIndexValues == undefined)
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);

  // get values combination
  const featureCombination = GetCombinationValues(combinationIndexValues, featureValues.featureOptionListData);

  const result: SingleInterface = {
    random: isRandom,
    features: featureCombination
  };
  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, result);
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SingleInterface>>) {
  const {campaign, combination} = req.query;
  
  if (campaign == undefined)
    return RequestResponse(res, "BadRequest", false,  DefaultApiResponse.MissingInfo);

  return await ProcessAndGetData(res, campaign as string, combination as string);
}

export async function GetUriApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SingleInterface>>) {
  const {single} = req.query;
  const [campaign, combination] = single as string[];

  return await ProcessAndGetData(res, campaign, combination);
}

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<number>>) {
  const {campaign, attributes} = req.body as SinglePostBody;
  
  if (campaign == undefined || attributes == undefined)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
  
  try {
    // On campaign not exist return bad request
    const isCampaign = await CheckCampaign(campaign);
    if (!isCampaign)
      return RequestResponse(res, "BadRequest", false, DefaultApiResponse.WrongInput);

    const realAttributes = Base64ToObj<BasicData[]>(attributes);
    if (realAttributes == undefined || !Array.isArray(realAttributes))
      return RequestResponse(res, "BadRequest", false,  DefaultApiResponse.WrongInput);

    // Update index on campaign
    const featureValues = await FindAndReadjustFeatureIndexes(campaign);
    if (featureValues == undefined)
      return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);

    // On invalid number use random combination
    const maxIndexValues = GetMaxIndexValues(featureValues.featureList, featureValues.featureOptionListData);

    const indexValues = realAttributes
      .filter(a => a.id !== EXPORT_ATTRIBUTE.Campaign)
      .map(a => {
        const featureIndex = featureValues.featureList.find(f => f.displayName === a.id)?.index;
        if (featureIndex == undefined) return;
        
        return featureValues.featureOptionListData.get(featureIndex)?.find(o => o.name === a.val)?.index;
      });
    
    const combination = IndexValuesStringToNumber(indexValues.join(GLOBAL_VALUES.CollectorIndexSeparator), maxIndexValues);
    if (combination == undefined)
      Raise("Error getting combination number from index values!");

    return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess, combination);
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, err.message, e);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}