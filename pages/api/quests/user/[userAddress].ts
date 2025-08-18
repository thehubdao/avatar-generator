import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../../interfaces/api.interface";
import { Quest } from "../../../../interfaces/quest.interface";
import { sampleQuests } from "../../../../utils/sampleQuestData";

interface QuestApiResponse {
  quests: Quest[];
}

export default async function Handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<QuestApiResponse>>
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

    // For now, return user-specific quests (in_progress, completed)
    // In a real implementation, this would query a database for user-specific quest data
    const userQuests = sampleQuests.filter(quest => 
      quest.status === 'in_progress' || quest.status === 'completed'
    );

    return res.status(200).json({
      success: true,
      message: 'User quests retrieved successfully',
      data: {
        quests: userQuests
      }
    });
  } catch (error) {
    console.error('Error fetching user quests:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: undefined
    });
  }
}
