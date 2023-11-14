import {NextApiRequest, NextApiResponse} from "next";
import {CampaignParameterName, CommonErrorCode} from "../../../enums/common.enum";
import {DefaultApiResponse} from "../../enums/api.enum";
import {FeatureBasic} from "../../../interfaces/common.interface";
import {ApiResponse} from "../../../interfaces/api.interface";
import {GetParameter} from "../../../utils/firebase.util";
import {RequestResponse} from "../request.api-handler";

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  const {campaign} = req.query;
  
  if (!campaign)
    return RequestResponse(res, "BadRequest", false,  DefaultApiResponse.MissingInfo);
  
  const useCampaign = typeof campaign === "string" ? campaign : campaign[0];
  const dataResult = await GetParameter<FeatureBasic[]>(useCampaign, CampaignParameterName.Accessories);
  
  if (dataResult.success) {
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, dataResult.value.map(d => d.displayName));
  }
  
  if (dataResult.errCode === CommonErrorCode.GetNoData) {
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetNoData);
  }
  
  return RequestResponse(res, "ServerError", true, DefaultApiResponse.GetFailure);
}