import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {GetParameter} from "../../../utils/firebase.util";
import {FirestoreParameters} from "../../../enums/firebase.enum";

async function CheckCampaign(campaign: string) {
  const campaigns = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  return campaigns == undefined ? false : campaigns.some(c => c === campaign);
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  const {campaign, combination} = req.query;
  
  if (campaign == undefined)
    return RequestResponse(res, "BadRequest", false,  DefaultApiResponse.MissingInfo);

  // On campaign not exist return bad request
  const isCampaign = await CheckCampaign(campaign as string);
  if (!isCampaign)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.WrongInput);

  // Update index on campaign
  
  
  // On empty number use random combination
  // Parse combination to number
  // On invalid number throw error
  
  // Collection util
  // If combination is out of bounds throw error
  // Try get combination
  // get values combination


  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, result);
}

export async function GetByCampaignApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  
}