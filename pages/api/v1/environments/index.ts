import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, EnvironmentInterface} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../server/api-handler/v1/environments.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<EnvironmentInterface[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler
  })
}
