import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../interfaces/api.interface";
import {RequestApiHandler} from "../../server/api-handler/request.api-handler";
import {UpdateAdminCampaignsApiHandler} from "../../server/api-handler/adminCampaigns.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<void>>) {
  return RequestApiHandler(req, res, {
    Post: UpdateAdminCampaignsApiHandler
  });
}