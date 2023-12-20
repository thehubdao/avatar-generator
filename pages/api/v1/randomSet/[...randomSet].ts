import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, RandomSet} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../server/api-handler/v1/randomSet.api-handler";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<RandomSet>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler
  });
}
