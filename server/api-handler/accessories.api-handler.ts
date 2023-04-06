import {NextApiRequest, NextApiResponse} from "next";
import {CampaignParameterName, GlobalValues} from "../../enums/common.enum";
import {DefaultApiResponse} from "../enums/api.enum";
import {BasicData} from "../../interfaces/common.interface";
import {ApiResponse} from "../../interfaces/api.interface";
import {GetParameter} from "../../utils/firebase.util";
import {RequestResponse} from "./request.api-handler";

export async function GetAccessoriesApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  const {campaign} = req.query;

  const useCampaign = campaign != undefined ? campaign as string : GlobalValues.BaseCampaign;
  const data = await GetParameter<BasicData[]>(useCampaign, CampaignParameterName.Accessories);

  const result = data == undefined ? [] : data.map(d => d.id);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, result);
}