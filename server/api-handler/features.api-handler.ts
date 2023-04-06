import {CampaignParameterName, GlobalValues} from "../../enums/common.enum";
import {GetParameter} from "../../utils/firebase.util";
import {BasicData} from "../../interfaces/common.interface";
import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../interfaces/api.interface";
import {RequestResponse} from "./request.api-handler";
import {DefaultApiResponse} from "../enums/api.enum";

export async function  GetFeaturesApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  const {campaign} = req.query;

  const useCampaign = campaign != undefined ? campaign as string : GlobalValues.BaseCampaign;
  const data = await GetParameter<BasicData[]>(useCampaign, CampaignParameterName.Features);

  const result = data == undefined ? [] : data.map(d => d.id);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, result);
}