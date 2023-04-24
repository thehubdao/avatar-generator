import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, SingleInterface} from "../../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../../server/api-handler/v1/single.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SingleInterface>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler
  });
}
