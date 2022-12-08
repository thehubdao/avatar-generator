import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {FirestoreLocation} from "../../enums/firebase.enum";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign, type } = req.query;
    
    const data = await GetInfoDB(FirestoreLocation.Accessories, campaign as string,{
      campaign: campaign as string ?? GlobalValues.BaseCampaign,
      type: type as string
    });

    res
      .status(200)
      .json(data);
  }
}
