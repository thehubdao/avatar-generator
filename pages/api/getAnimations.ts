import {NextApiRequest, NextApiResponse} from "next";
import {AnimationInterface, ApiResponse} from "../../interfaces/api.interface";
import {RequestApiHandler} from "../../server/api-handler/request.api-handler";
import {GetAnimationApiHandler} from "../../server/api-handler/animations.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AnimationInterface[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetAnimationApiHandler
  });
}
