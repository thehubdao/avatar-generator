import {NextApiRequest, NextApiResponse} from "next";
import {DefaultApiResponses, RequestMethod} from "../../enums/api.enum";
import {ApiResponse} from "../../interfaces/api.interface";
import {UpdateAdminCampaigns} from "../../utils/firebase.util";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<void>>) {
  if (req.method == RequestMethod.Post) {
    
    await UpdateAdminCampaigns();

    return res
      .status(200)
      .json({
        success: true,
        message: DefaultApiResponses.PostSuccess,
      });
  }
  
  res
    .status(400)
    .json({
      success: false,
      message: DefaultApiResponses.BadRequest,
    });
}