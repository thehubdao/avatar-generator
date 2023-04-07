import {NextApiRequest, NextApiResponse} from "next";
import {GlobalValues} from "../../../enums/common.enum";
import {GetInfoDB} from "../../../utils/firebase.util";
import {AccessoryInterface, ApiResponse} from "../../../interfaces/api.interface";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {DefaultApiResponse} from "../../enums/api.enum";
import {RequestResponse} from "../request.api-handler";


async function GetData(campaign?: string, type?: string) {
  const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;

  return GetInfoDB<AccessoryInterface>(FirestoreLocation.Accessories, realCampaign, {
    type: type as string
  });
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  const {campaign, type} = req.query;

  const data = await GetData(campaign as string, type as string);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}

export async function GetByCampaignApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  const {campaign} = req.query;
  
  const data = await GetData(campaign as string);
  
  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}