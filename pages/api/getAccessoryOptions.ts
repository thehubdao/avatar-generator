import {NextApiRequest, NextApiResponse} from "next";
import {AccessoryInterface, ApiResponse} from "../../interfaces/api.interface";
import {RequestApiHandler} from "../../server/api-handler/request.api-handler";
import {GetAccessoryOptionsApiHandler} from "../../server/api-handler/accessoryOptions.api-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  return RequestApiHandler(req, res, {
    Get: GetAccessoryOptionsApiHandler
  });
}
