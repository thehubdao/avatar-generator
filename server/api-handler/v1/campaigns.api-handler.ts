import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {GetParameter} from "../../../utils/firebase.util";
import {FirestoreParameters} from "../../../enums/firebase.enum";
import {FirebaseError} from "@firebase/util";
import {LogError} from "../../../utils/common.util";
import {Module} from "../../../enums/common.enum";

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  try {
    const campaignList = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
    if (campaignList.success)
      return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, campaignList.value);
    
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.ApiUtil, err.message, e);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}