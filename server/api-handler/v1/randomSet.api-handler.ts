import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, RandomSet} from "../../../interfaces/api.interface";
import {GetInfoDB, GetParameter} from "../../../utils/firebase.util";
import {FirestoreGlobalLocation, FirestoreParameters} from "../../../enums/firebase.enum";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {LogError} from "../../../utils/common.util";
import {Module} from "../../../enums/common.enum";
import {CollectionItem} from "../../interfaces/collection.interface";
import {CollectionStatus} from "../../enums/collection.enum";

// Gets one random from the list that is on status waiting
export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<RandomSet>>) {
  const {randomSet} = req.query;
  const [campaign] = randomSet as string[];
  
  try {
    // On campaign not exist return bad request
    const isCampaign = await CheckCampaign(campaign);
    if (!isCampaign)
      return RequestResponse(res, "BadRequest", false, DefaultApiResponse.WrongInput);
    
    const collectionRoute = `${FirestoreGlobalLocation.Collection}/${campaign}/nft`;
    const collectionList = await GetInfoDB<CollectionItem>(collectionRoute, undefined, {
      collectionStatus: CollectionStatus.NotMinted
    });
    if (!collectionList.success)
      return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
    
    const rand = Math.random();
    let acc = 0;
    for (const item of collectionList.value) {
      const itemChance = item.chance ?? 0;
      acc += itemChance;
      if (rand < acc)
        return RequestResponse(res, "Successful", true,  DefaultApiResponse.GetSuccess, {
          id: item.id,
          indexValues: item.indexValues,
        });
    }

    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
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