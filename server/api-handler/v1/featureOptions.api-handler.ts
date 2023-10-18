import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../../utils/firebase.util";
import {ApiResponse, FeatureInterface} from "../../../interfaces/api.interface";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import { GLOBAL_VALUES } from "../../../constants/common.constant";

export async function GetData(campaign?: string, type?: string) {
  const realCampaign = campaign ?? GLOBAL_VALUES.BaseCampaign;

  return GetInfoDB<FeatureInterface>(FirestoreLocation.Features, realCampaign, {
    type: type
  });
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<FeatureInterface[]>>) {
  const {campaign, type} = req.query;
  const data = await GetData(campaign as string, type as string);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}

export async function GetUriApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<FeatureInterface[]>>) {
  const {options} = req.query;
  const [campaign, type] = options as string[];
  
  const data = await GetData(campaign, type);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}