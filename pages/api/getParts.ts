import {NextApiRequest, NextApiResponse} from "next";
import {FirebaseUtil} from "../../utils/firebase.util";
import {FirestoreValues, GlobalValues} from "../../enums/common.enum";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign, type } = req.query;
    const data = await FirebaseUtil.Instance().GetInfoDB( FirestoreValues.Parts,{
      campaign: campaign as string ?? GlobalValues.BaseCampaign,
      type: type as string | undefined
    });
    
    res
      .status(200)
      .json(data);
  }
}
