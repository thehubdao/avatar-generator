import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {LogError} from "../../../utils/common.util";
import {Module} from "../../../enums/common.enum";
import {GetProcess} from "../../utils/side-process.util";
import {ProcessInfo} from "../../interfaces/process.interface";

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<ProcessInfo>>) {
  const {process} = req.query;
  const [processId] = process as string[];

  try {
    const leProcess = await GetProcess(processId);

    return leProcess.success ?
      RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, leProcess.value) :
      RequestResponse(res, "ServerError", false, leProcess.errMessage);
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, err.message, e);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}