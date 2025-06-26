import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { DefaultApiResponse } from "../../enums/api.enum";
import { RequestResponse } from "../request.api-handler";
import { GetRootRegistryAuthToken, UpdateRootAsset } from "../../../utils/web3/root/registry.util";
import { InitializeContractEssentialData, ROOT_SIGNER_PK } from "../../../constants/root/contract.constant";
import { GetAdminSigner } from "../../../utils/web3/root/contract.util";

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  const { data } = req.body;
  const { events } = data;
  const event = events[0];
  const [, , , , collectionId, tokenId] = event.args[1].split(':');

  if (!data)
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);

  const authToken = await GetRootRegistryAuthToken(ROOT_SIGNER_PK);

  if (!authToken.success) return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);

  const adminSigner = GetAdminSigner();
  await InitializeContractEssentialData(undefined, adminSigner);
  const updateRootAssetResult = await UpdateRootAsset(collectionId, tokenId, authToken.value, events);

  if (!updateRootAssetResult.success) return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess);

}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string>>) {
  const authToken = await GetRootRegistryAuthToken(ROOT_SIGNER_PK);
  if (!authToken.success) return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);

  return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess, authToken.value);
}