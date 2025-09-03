import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { RequestResponse } from "../request.api-handler";
import { BurnDrop, CheckClaimApprove } from "../../../utils/web3/lukso/contract.util";
import { DropToClaim } from "../../../interfaces/citizens.interface";

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<DropToClaim[]>>) {
  const { drops, walletAddress } = req.body;

  if (drops.length === 0 || !walletAddress) {
    return RequestResponse(res, "BadRequest", false, "No drops or wallet address provided");
  }

  const result = await CheckClaimApprove(drops, walletAddress);

  if (result.success) {
    return RequestResponse(res, "Successful", true, "Claim approval processed successfully", result.value);
  }

  return RequestResponse(res, "ServerError", false, "Error processing claim approval");
}

export async function PostBurnDropsApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<boolean>>) {
  const { burnDropsArray, campaign, walletAddress } = req.body;

  if (!burnDropsArray) {
    return RequestResponse(res, "BadRequest", false, "Missing or invalid burn drops array");
  }

  for (const drop of burnDropsArray) {
    await BurnDrop(walletAddress, campaign, drop);
  }

  return RequestResponse(res, "Successful", true, "Drops fetched successfully", true);
}