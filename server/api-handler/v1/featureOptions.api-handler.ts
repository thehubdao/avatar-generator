import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../../utils/firebase.util";
import {ApiResponse, FeatureInterface} from "../../../interfaces/api.interface";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";

export async function GetData(campaign: string, type?: string) {
  return GetInfoDB<FeatureInterface>(FirestoreLocation.Features, campaign, {
    type: type
  });
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<FeatureInterface[]>>) {
  const {campaign, type} = req.query;
  if (!campaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.BadRequest);
  
  const dataResult = await GetData(campaign as string, type as string);
  
  if (dataResult.success)
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, dataResult.value);

  return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
}

export async function GetUriApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<FeatureInterface[]>>) {
  const {options} = req.query;
  const [campaign, type] = options as string[];
  if (!campaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.BadRequest);
  
  const dataResult = await GetData(campaign, type);

  if (dataResult.success)
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, dataResult.value);

  return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
}