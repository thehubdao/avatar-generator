import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { RequestResponse } from "../request.api-handler";
import { DefaultApiResponse } from "../../enums/api.enum";
import { GetUserXPAndLevel, UpdateLastLoginDate, TrackUserLogin } from "../../../utils/firebase.util";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseUtil } from "../../../utils/firebase.util";

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<{
  xp: number;
  level: number;
  nextLevelXP: number;
}>>) {
  const { address } = req.body; 
  if (!address) {
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
  }

  try {
    // Handle login rewards first
    await HandleXPReward(address);
    
    // Get updated XP data after rewards
    const xpData = await GetUserXPAndLevel(address);

    return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess, {
      xp: xpData.xp,
      level: xpData.level,
      nextLevelXP: xpData.nextLevelXP
    });
  } catch (error) {
    console.error('XP verification error:', error);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}

async function HandleXPReward(address: string): Promise<void> {
  try {
    // Update last login and get login rewards
    const loginResult = await UpdateLastLoginDate(address);
    
    // Track every login attempt
    await TrackUserLogin(address);
    
    if (!loginResult.success) {
      console.error('Error updating last login:', loginResult);
    }
  } catch (error) {
    console.error('Error handling XP reward:', error);
  }
}

async function CheckUserDailyLogin(address: string): Promise<boolean> {
  try {
    const db = await FirebaseUtil.Instance().DB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];
    
    const userLoginRef = doc(db, 'statistics', 'dailyLogins', 'users', address, 'dates', dateString);
    const userLoginDoc = await getDoc(userLoginRef);
    
    return userLoginDoc.exists();
  } catch (error) {
    console.error('Error checking user daily login:', error);
    return false;
  }
}