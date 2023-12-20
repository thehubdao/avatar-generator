import {NextApiRequest, NextApiResponse} from "next";
import {UpdateAdminCampaigns} from "../../../utils/firebase.util";
import {ApiResponse} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";

export async function UpdateApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<void>>) {
  const result = await UpdateAdminCampaigns();
  
  return result.success ?
    RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess) :
    RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
}