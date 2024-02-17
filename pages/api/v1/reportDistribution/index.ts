import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, SingleInterface} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import { PostApiHandler } from "../../../../server/api-handler/v1/reportDistribution.api-handler";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SingleInterface | number>>) {
  return RequestApiHandler(req, res, {
    Post: PostApiHandler,
  });
}
