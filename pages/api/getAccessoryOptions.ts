import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {FirestoreLocation} from "../../enums/firebase.enum";
import {AccessoryInterface, ApiResponse} from "../../interfaces/api.interface";
import {DefaultApiResponses} from "../../enums/api.enum";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AccessoryInterface[]>>) {
  if (req.method === 'GET') {
    const {campaign, type} = req.query;
    
    const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;

    const data = await GetInfoDB<AccessoryInterface>(FirestoreLocation.Accessories, realCampaign, {
      campaign: realCampaign,
      type: type as string
    });

    return res
      .status(200)
      .json({
        success: true,
        message: DefaultApiResponses.GetSuccess,
        data
      });
  }

  res
    .status(400)
    .json({
      success: false,
      message: DefaultApiResponses.BadRequest,
    });
}
