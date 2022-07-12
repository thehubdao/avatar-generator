import {NextApiRequest, NextApiResponse} from "next";
import {FirebaseUtil} from "../../utils/firebase.util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign, type } = req.query;
    const data = await FirebaseUtil.Instance().GetAccessories(campaign as string ?? 'base', type as string);

    res
      .status(200)
      .json(data);
  }
}
