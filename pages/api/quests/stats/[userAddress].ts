import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../../interfaces/api.interface";
import { QuestStats } from "../../../../interfaces/quest.interface";
import { sampleQuestStats } from "../../../../utils/sampleQuestData";

interface QuestStatsApiResponse {
  stats: QuestStats;
}

export default async function Handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<QuestStatsApiResponse>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: undefined
    });
  }

  try {
    const { userAddress } = req.query;

    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'User address is required',
        data: undefined
      });
    }

    // For now, return sample quest stats
    // In a real implementation, this would calculate stats from user's quest history
    return res.status(200).json({
      success: true,
      message: 'Quest stats retrieved successfully',
      data: {
        stats: sampleQuestStats
      }
    });
  } catch (error) {
    console.error('Error fetching quest stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: undefined
    });
  }
}
