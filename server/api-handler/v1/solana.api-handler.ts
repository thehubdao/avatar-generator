import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {FirebaseError} from "@firebase/util";
import {LogError} from "../../../utils/common.util";
import {Module} from "../../../enums/common.enum";
import { InitializeServerAdminData } from "../../../constants/solana/contract.constant";
import { TransactionBuilder } from "@metaplex-foundation/umi";
import { UpdateAsset } from "../../../utils/web3/solana/contract.util";

InitializeServerAdminData();

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<TransactionBuilder>>) {
  try {
    const result = await UpdateAsset(req.body.assetAddress, req.body.uri);
    if (result.success)
      return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, result.value);
    
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.ApiUtil, err.message, e);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}