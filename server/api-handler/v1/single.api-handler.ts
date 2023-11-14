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
  NumberToIndexValues,
  IndexValuesStringToNumber
} from "../../../utils/collection.util";
import {CastStringToInteger, RandomIntMax} from "../../../utils/common.util";
import {GLOBAL_VALUES} from "../../../constants/common.constant";

async function CheckCampaign(campaign: string) {
  const campaignsResult = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  return campaignsResult.success ? campaignsResult.value.some(c => c === campaign) : false;
}

function ProcessCombination(combination: string, maxValues: Map<number, number>) {
  if (combination != undefined && combination.includes(GLOBAL_VALUES.CollectorIndexSeparator)) {
    return IndexValuesStringToNumber(combination, maxValues);
  }
  
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
  let combinationNum = ProcessCombination(combination as string, maxIndexValues);
  let isRandom = false;

  // Collection util
  // If combination is out of bounds throw error
  if (combinationNum == undefined || combinationNum < 0) {
    // random
    isRandom = true;
    combinationNum = RandomIntMax(maxCombination);
  }
  else if (combinationNum > maxCombination) {
    // Error
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.WrongInput);
  }

  // Try get combination
  const combinationIndexValues = NumberToIndexValues(combinationNum, maxCombination, maxIndexValues);
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