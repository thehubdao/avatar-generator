import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, SingleInterface} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler, PostApiHandler} from "../../../../server/api-handler/v1/single.api-handler";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SingleInterface | number>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler,
    Post: PostApiHandler,
  });
}