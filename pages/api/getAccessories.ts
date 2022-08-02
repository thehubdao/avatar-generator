import {NextApiRequest, NextApiResponse} from "next";
import {FirebaseUtil} from "../../utils/firebase.util";
import {GlobalValues} from "../../enums/common.enum";
import {FirestoreValues} from "../../enums/firebase.enum";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign, type } = req.query;
    const data = await FirebaseUtil.Instance().GetInfoDB(FirestoreValues.Accessories,{
      campaign: campaign as string ?? GlobalValues.BaseCampaign,
      type: type as string
    });

    res
      .status(200)
      .json(data);
  }
}
