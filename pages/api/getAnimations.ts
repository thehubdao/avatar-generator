import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {FirestoreLocation} from "../../enums/firebase.enum";
import {AnimationInterface} from "../../interfaces/api.interface";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign } = req.query;
    const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;
    
    const data = await GetInfoDB<AnimationInterface>(FirestoreLocation.Animations, undefined, {
      campaign: realCampaign
    });

    res
      .status(200)
      .json(data);
  }
}
