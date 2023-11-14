import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../../utils/firebase.util";
import {AccessoryInterface, ApiResponse} from "../../../interfaces/api.interface";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {DefaultApiResponse} from "../../enums/api.enum";
import {RequestResponse} from "../request.api-handler";

async function GetData(campaign: string, type?: string) {
  return GetInfoDB<AccessoryInterface>(FirestoreLocation.Accessories, campaign, {
    type: type
  });
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  const {campaign, type} = req.query;
  
  if (!campaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
  
  const useCampaign = typeof campaign === "string" ? campaign : campaign[0];
  const useType = type && typeof type === "string" ? type : type?.at(0);
  
  const dataResult = await GetData(useCampaign, useType);
  
  if (dataResult.success)
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, dataResult.value);
  
  return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
}

export async function GetUriApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  const {options} = req.query;
  const [campaign, type] = options as string[];

  if (!campaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
  
  const dataResult = await GetData(campaign, type);

  if (dataResult.success)
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, dataResult.value);

  return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
}