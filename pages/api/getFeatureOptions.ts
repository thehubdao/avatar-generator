import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {FirestoreLocation} from "../../enums/firebase.enum";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign, type } = req.query;
    const realCampaign = campaign as string ?? GlobalValues.BaseCampaign;
    
    const data = await GetInfoDB( FirestoreLocation.Features, realCampaign, {
      campaign: realCampaign,
      type: type as string | undefined
    });
    
    res
      .status(200)
      .json(data);
  }
}
