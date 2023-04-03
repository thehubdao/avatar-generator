import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {FirestoreLocation} from "../../enums/firebase.enum";
import {ApiResponse, EnvironmentInterface} from "../../interfaces/api.interface";
import {DefaultApiResponses} from "../../enums/api.enum";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<EnvironmentInterface[]>>) {
  if (req.method === 'GET') {
    const {campaign} = req.query;
    const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;

    const data = await GetInfoDB<EnvironmentInterface>(FirestoreLocation.Environments, realCampaign, {
      campaign: realCampaign
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
