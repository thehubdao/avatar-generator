import {NextApiRequest, NextApiResponse} from "next";
import {GlobalValues} from "../../../enums/common.enum";
import {GetInfoDB} from "../../../utils/firebase.util";
import {ApiResponse, EnvMapInterface} from "../../../interfaces/api.interface";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<EnvMapInterface[]>>) {
  const {campaign} = req.query;
  const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;

  const data = await GetInfoDB<EnvMapInterface>(FirestoreLocation.EnvMaps, realCampaign);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data);
}