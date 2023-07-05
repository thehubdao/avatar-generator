import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, ScenarioInterface} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../server/api-handler/v1/scenarios.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<ScenarioInterface[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler
  })
}
