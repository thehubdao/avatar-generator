import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { RequestResponse } from "../request.api-handler";
import { BurnDrop, CheckClaimApprove } from "../../../utils/web3/lukso/contract.util";
import { CheckPolygonClaimApprove } from "../../../utils/web3/polygon/contract.util";
import { DropToClaim } from "../../../interfaces/citizens.interface";
import { Blockchain } from "../../../enums/blockchain/common.enum";

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<DropToClaim[]>>) {
  const { drops, walletAddress, blockchain } = req.body;

  if (drops.length === 0 || !walletAddress) {
    return RequestResponse(res, "BadRequest", false, "No drops or wallet address provided");
  }

  // Determine which blockchain to use (default to Lukso for backward compatibility)
  const blockchainType = blockchain || Blockchain.Lukso;

  let result;
  if (blockchainType === Blockchain.Polygon) {
    result = await CheckPolygonClaimApprove(drops, walletAddress);
  } else {
    // Lukso or default
    result = await CheckClaimApprove(drops, walletAddress);
  }

  if (result.success) {
    return RequestResponse(res, "Successful", true, "Claim approval processed successfully", result.value);
  }

  return RequestResponse(res, "ServerError", false, "Error processing claim approval");
}

export async function PostBurnDropsApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<boolean>>) {
  const { burnDropsArray, walletAddress } = req.body;

  if (!burnDropsArray) {
    return RequestResponse(res, "BadRequest", false, "Missing or invalid burn drops array");
  }

  for (const drop of burnDropsArray) {
    await BurnDrop(walletAddress, drop);
  }

  return RequestResponse(res, "Successful", true, "Drops fetched successfully", true);
}