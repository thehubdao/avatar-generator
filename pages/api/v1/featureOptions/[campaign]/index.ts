import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, FeatureInterface} from "../../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../../server/api-handler/request.api-handler";
import {GetByCampaignApiHandler} from "../../../../../server/api-handler/v1/featureOptions.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<FeatureInterface[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetByCampaignApiHandler
  })
}
