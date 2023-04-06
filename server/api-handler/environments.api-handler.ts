import {GlobalValues} from "../../enums/common.enum";
import {GetInfoDB} from "../../utils/firebase.util";
import {ApiResponse, EnvironmentInterface} from "../../interfaces/api.interface";
import {FirestoreLocation} from "../../enums/firebase.enum";
import {NextApiRequest, NextApiResponse} from "next";
import {RequestResponse} from "./request.api-handler";
import {DefaultApiResponse} from "../enums/api.enum";

export async function GetEnvironmentsApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<EnvironmentInterface[]>>) {
  const {campaign} = req.query;
  const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;

  const data = await GetInfoDB<EnvironmentInterface>(FirestoreLocation.Environments, realCampaign, {
    campaign: realCampaign
  });

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}