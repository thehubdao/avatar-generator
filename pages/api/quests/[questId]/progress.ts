import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../../interfaces/api.interface";

interface QuestProgressResponse {
  success: boolean;
  message: string;
}

export default async function Handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<QuestProgressResponse>>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: undefined
    });
  }

  try {
    const { questId } = req.query;
    const { userAddress, progress } = req.body;

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

    if (typeof progress !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Progress must be a number',
        data: undefined
      });
    }

    // In a real implementation, this would:
    // 1. Validate the quest exists and user has it active
    // 2. Update quest progress in database
    // 3. Check if quest is completed and trigger rewards

    return res.status(200).json({
      success: true,
      message: 'Quest progress updated successfully',
      data: {
        success: true,
        message: `Quest ${questId} progress updated to ${progress} for user ${userAddress}`
      }
    });
  } catch (error) {
    console.error('Error updating quest progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: undefined
    });
  }
}
