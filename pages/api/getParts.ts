import {NextApiRequest, NextApiResponse} from "next";
import {FirebaseUtil} from "../../utils/firebase.util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign, type } = req.query;
    const data = await FirebaseUtil.Instance().GetParts(campaign as string ?? 'base', Math.round(Number(type)));
    
    res
      .status(200)
      .json(data);
  }
}
