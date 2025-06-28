import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { RequestResponse } from "../request.api-handler";
import { DefaultApiResponse } from "../../enums/api.enum";
import { GetUserXPAndLevel, UpdateLastLoginDate, TrackUserLogin } from "../../../utils/firebase.util";
import { Blockchain } from "../../../enums/blockchain/common.enum";
import { LogError } from "../../../utils/common.util";
import { Module } from "../../../enums/common.enum";

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<{
  xp: number;
  level: number;
  nextLevelXP: number;
}>>) {
  const { address, blockchainType } = req.body; 
  if (!address || !blockchainType) {
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
  }

  try {
    // Handle login rewards first
    await HandleXPReward(address, blockchainType);
    
    // Get updated XP data after rewards
    const xpData = await GetUserXPAndLevel(address);

    return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess, {
      xp: xpData.xp,
      level: xpData.level,
      nextLevelXP: xpData.nextLevelXP
    });
  } catch (error) {
    LogError(Module.ApiUtil, 'XP verification error:', error);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}

async function HandleXPReward(address: string, blockchainType: Blockchain): Promise<void> {
  try {
    // Update last login and get login rewards
    const loginPromise = UpdateLastLoginDate(address, blockchainType);
    const trackPromise = TrackUserLogin(address);
    const [loginResult, trackResult] = await Promise.all([loginPromise, trackPromise]);
    
    if (!loginResult.success) {
      LogError(Module.ApiUtil, 'Error updating last login:', loginResult.errMessage);
    }
    if (!trackResult.success) {
      LogError(Module.ApiUtil, 'Error tracking user login:', trackResult.errMessage);
    }
  } catch (error) {
    LogError(Module.ApiUtil, 'Error handling XP reward:', error);
  }
}
