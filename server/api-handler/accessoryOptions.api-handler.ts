import {GlobalValues} from "../../enums/common.enum";
import {GetInfoDB} from "../../utils/firebase.util";
import {AccessoryInterface, ApiResponse} from "../../interfaces/api.interface";
import {FirestoreLocation} from "../../enums/firebase.enum";
import {DefaultApiResponse} from "../enums/api.enum";
import {NextApiRequest, NextApiResponse} from "next";
import {RequestResponse} from "./request.api-handler";

export async function GetAccessoryOptionsApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  const {campaign, type} = req.query;

  const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;

  const data = await GetInfoDB<AccessoryInterface>(FirestoreLocation.Accessories, realCampaign, {
    campaign: realCampaign,
    type: type as string
  });

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}