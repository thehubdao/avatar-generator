import {UpdateAdminCampaigns} from "../../utils/firebase.util";
import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../interfaces/api.interface";
import {RequestResponse} from "./request.api-handler";
import {DefaultApiResponse} from "../enums/api.enum";

export async function UpdateAdminCampaignsApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<void>>) {
  await UpdateAdminCampaigns();

  return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess);
}