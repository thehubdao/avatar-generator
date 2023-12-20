import {NextApiRequest, NextApiResponse} from "next";
import {CampaignParameterName, CommonErrorCode} from "../../../enums/common.enum";
import {GetParameter} from "../../../utils/firebase.util";
import {FeatureBasic} from "../../../interfaces/common.interface";
import {ApiResponse} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";

export async function  GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  const {campaign} = req.query;

  if (!campaign)
    return RequestResponse(res, "BadRequest", false,  DefaultApiResponse.MissingInfo);
  
  const useCampaign = typeof campaign === "string" ? campaign : campaign[0];
  const dataResult = await GetParameter<FeatureBasic[]>(useCampaign, CampaignParameterName.Features);
  
  if (dataResult.success) {
    const result = dataResult.value.map(d => d.displayName);
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, result);
  }
  
  if (dataResult.errCode === CommonErrorCode.GetNoData)
    return RequestResponse(res, "Successful", false, DefaultApiResponse.GetNoData);

  return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
}