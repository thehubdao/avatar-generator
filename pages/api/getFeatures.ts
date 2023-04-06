import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../interfaces/api.interface";
import {RequestApiHandler} from "../../server/api-handler/request.api-handler";
import {GetFeaturesApiHandler} from "../../server/api-handler/features.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetFeaturesApiHandler
  });
}
