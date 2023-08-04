import {NextApiRequest, NextApiResponse} from "next";
import {AccessoryInterface, ApiResponse} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../server/api-handler/v1/accessoryOptions.api-handler";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler
  });
}
