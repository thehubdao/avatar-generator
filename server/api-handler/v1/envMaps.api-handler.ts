import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../../utils/firebase.util";
import {ApiResponse, EnvMapInterface} from "../../../interfaces/api.interface";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<EnvMapInterface[]>>) {
  const {campaign} = req.query;
  
  if (!campaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
  
  const realCampaign = typeof campaign === "string" ? campaign : campaign[0];

  const dataResult = await GetInfoDB<EnvMapInterface>(FirestoreLocation.EnvMaps, realCampaign);
  
  if (dataResult.success)
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, dataResult.value);

  return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
}