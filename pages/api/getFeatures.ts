import {NextApiRequest, NextApiResponse} from "next";
import {GetParameters} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {BasicData} from "../../interfaces/common.interface";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign } = req.query;

    const useCampaign = campaign != undefined ? campaign as string : GlobalValues.BaseCampaign;
    const [data] = await GetParameters<BasicData[]>(useCampaign);
    const result = data.map(d => d.id);
    
    res
      .status(200)
      .json(result);
  }
}
