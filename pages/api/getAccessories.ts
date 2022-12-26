import {NextApiRequest, NextApiResponse} from "next";
import {GetParameter} from "../../utils/firebase.util";
import {CampaignParameterName, GlobalValues} from "../../enums/common.enum";
import {BasicData} from "../../interfaces/common.interface";
import {DefaultApiResponses, RequestMethod} from "../../enums/api.enum";
import {ApiResponse} from "../../interfaces/api.interface";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  if (req.method === RequestMethod.Get) {
    const {campaign} = req.query;

    const useCampaign = campaign != undefined ? campaign as string : GlobalValues.BaseCampaign;
    const data = await GetParameter<BasicData[]>(useCampaign, CampaignParameterName.Accessories);

    const result = data == undefined ? [] : data.map(d => d.id);

    return res
      .status(200)
      .json({
        success: true,
        message: DefaultApiResponses.GetSuccess,
        data: result,
      });
  }

  res
    .status(400)
    .json({
      success: false,
      message: DefaultApiResponses.BadRequest,
    });
}
