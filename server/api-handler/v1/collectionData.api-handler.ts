import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, CollectionDataInterface} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {GetParameter} from "../../../utils/firebase.util";
import {FirestoreParameters} from "../../../enums/firebase.enum";
import {FindAndReadjustFeatureIndexes, GetMaxCombinationNum, GetMaxIndexValues} from "../../../utils/collection.util";
import {LogError} from "../../../utils/common.util";
import {Module} from "../../../enums/common.enum";
import {GLOBAL_VALUES} from "../../../constants/common.constant";

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

async function CheckCampaign(campaign: string) {
  const campaignsResult = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  return campaignsResult.success ? campaignsResult.value.some(c => c === campaign) : false;
}