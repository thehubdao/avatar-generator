import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {FirestoreLocation} from "../../enums/firebase.enum";
import {AnimLocationApi} from "../../interfaces/api.interface";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign } = req.query;
    const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;
    
    const data = await GetInfoDB<AnimLocationApi>(FirestoreLocation.Animations, realCampaign, {
      campaign: realCampaign
    });

    res
      .status(200)
      .json(data);
  }
}
