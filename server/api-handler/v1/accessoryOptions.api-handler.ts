import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../../utils/firebase.util";
import {AccessoryInterface, ApiResponse} from "../../../interfaces/api.interface";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {DefaultApiResponse} from "../../enums/api.enum";
import {RequestResponse} from "../request.api-handler";
import {GLOBAL_VALUES} from "../../../constants/common.constant";


async function GetData(campaign?: string, type?: string) {
  const realCampaign = campaign as string ?? GLOBAL_VALUES.BaseCampaign;

  return GetInfoDB<AccessoryInterface>(FirestoreLocation.Accessories, realCampaign, {
    type: type as string
  });
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  const {campaign, type} = req.query;

  const data = await GetData(campaign as string, type as string);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}

export async function GetUriApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  const {options} = req.query;
  const [campaign, type] = options as string[];
  
  const data = await GetData(campaign, type);
  
  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}