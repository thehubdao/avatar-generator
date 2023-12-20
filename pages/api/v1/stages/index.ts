import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, StageInterface} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../server/api-handler/v1/stages.api-handler";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<StageInterface[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler
  })
}
