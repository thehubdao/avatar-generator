import {NextApiRequest, NextApiResponse} from "next";
import {GetParameters} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {BasicData} from "../../interfaces/common.interface";
import {ApiResponse} from "../../interfaces/api.interface";
import {DefaultApiResponses} from "../../enums/api.enum";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  if (req.method === 'GET') {
    const {campaign} = req.query;

    const useCampaign = campaign != undefined ? campaign as string : GlobalValues.BaseCampaign;
    const [data] = await GetParameters<BasicData[]>(useCampaign, useCampaign);
    
    const result = data == undefined ? [] : data.map(d => d.id);

    return res
      .status(200)
      .json({
        success: true,
        message: DefaultApiResponses.GetSuccess,
        data: result
      });
  }
  
  res
    .status(400)
    .json({
      success: false,
      message: DefaultApiResponses.BadRequest,
    });
}
