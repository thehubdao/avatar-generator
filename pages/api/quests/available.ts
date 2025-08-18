import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { Quest } from "../../../interfaces/quest.interface";
import { sampleQuests } from "../../../utils/sampleQuestData";

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

    // Filter available quests (excluding user-specific in-progress/completed quests)
    const availableQuests = sampleQuests.filter(quest => 
      quest.status === 'available' || quest.status === 'locked'
    );

    return res.status(200).json({
      success: true,
      message: 'Available quests retrieved successfully',
      data: {
        quests: availableQuests
      }
    });
  } catch (error) {
    console.error('Error fetching available quests:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: undefined
    });
  }
}
