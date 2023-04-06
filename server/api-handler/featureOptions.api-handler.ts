import {GlobalValues} from "../../enums/common.enum";
import {GetInfoDB} from "../../utils/firebase.util";
import {ApiResponse, FeatureInterface} from "../../interfaces/api.interface";
import {FirestoreLocation} from "../../enums/firebase.enum";
import {NextApiRequest, NextApiResponse} from "next";
import {RequestResponse} from "./request.api-handler";
import {DefaultApiResponse} from "../enums/api.enum";

export async function GetFeatureOptionsApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<FeatureInterface[]>>) {
  const {campaign, type} = req.query;
  const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;

  const data = await GetInfoDB<FeatureInterface>(FirestoreLocation.Features, realCampaign, {
    campaign: realCampaign,
    type: type as string | undefined
  });

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}