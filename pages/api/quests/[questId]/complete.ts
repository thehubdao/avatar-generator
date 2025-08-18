import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../../interfaces/api.interface";

interface QuestCompleteResponse {
  success: boolean;
  message: string;
}

export default async function Handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<QuestCompleteResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: undefined
    });
  }

  try {
    const { questId } = req.query;
    const { userAddress } = req.body;

    if (!questId || typeof questId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Quest ID is required',
        data: undefined
      });
    }

    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'User address is required',
        data: undefined
      });
    }

    // In a real implementation, this would:
    // 1. Validate the quest exists and user has it active
    // 2. Check if quest can be completed (progress requirements met)
    // 3. Mark quest as completed
    // 4. Distribute rewards
    // 5. Update user stats

    return res.status(200).json({
      success: true,
      message: 'Quest completed successfully',
      data: {
        success: true,
        message: `Quest ${questId} completed for user ${userAddress}`
      }
    });
  } catch (error) {
    console.error('Error completing quest:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: undefined
    });
  }
}
