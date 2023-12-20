import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../server/api-handler/v1/process.api-handler";
import {ProcessInfo} from "../../../../server/interfaces/process.interface";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<ProcessInfo>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler
  });
}
