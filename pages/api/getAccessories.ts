import {NextApiRequest, NextApiResponse} from "next";
import {FirebaseUtil} from "../../utils/firebase.util";
import {AccessoryPartTypeEnum} from "../../enums/common.enum";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const { campaign, type } = req.query;
    const data = await FirebaseUtil.Instance().GetAccessories(campaign as string ?? 'base', type as AccessoryPartTypeEnum);

    res
      .status(200)
      .json(data);
  }
}
