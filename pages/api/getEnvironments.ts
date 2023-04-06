import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, EnvironmentInterface} from "../../interfaces/api.interface";
import {RequestApiHandler} from "../../server/api-handler/request.api-handler";
import {GetEnvironmentsApiHandler} from "../../server/api-handler/environments.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<EnvironmentInterface[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetEnvironmentsApiHandler
  })
}
