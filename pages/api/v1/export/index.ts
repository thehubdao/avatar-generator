import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../server/api-handler/v1/export.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler
  });
}