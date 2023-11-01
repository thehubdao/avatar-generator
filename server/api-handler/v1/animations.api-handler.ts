import {NextApiRequest, NextApiResponse} from "next";
import {GetInfoDB} from "../../../utils/firebase.util";
import {AnimationInterface, ApiResponse} from "../../../interfaces/api.interface";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";

async function HandleData(res: NextApiResponse<ApiResponse<AnimationInterface[]>>, campaign: string, name: string | undefined) {
  const data = await GetInfoDB<AnimationInterface>(FirestoreLocation.Animations, campaign, {
    name
  });

  if (data.success)
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, data.value);

  return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AnimationInterface[]>>) {
  const {campaign, name} = req.query;

  if (!campaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);

  const useCampaign = typeof campaign === "string" ? campaign : campaign[0];
  const useName = name && typeof name === "string" ? name : name?.at(0);

  return HandleData(res, useCampaign, useName);
}

export async function GetApiPathHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AnimationInterface[]>>) {
  const {options} = req.query;
  const [campaign, name] = options as (string | undefined)[];
  
  if (!campaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);

  return HandleData(res, campaign, name);
}