import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../../interfaces/api.interface';
import { RequestResponse } from '../../../../server/api-handler/request.api-handler';
import { HandleBurnXPReward } from '../../../../server/api-handler/v1/burns.api-handler';
import { Blockchain } from '../../../../enums/blockchain/common.enum';

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ success: boolean }>>
) {
  if (req.method === 'POST') {
    const { address, burns } = req.body;
    
    if (!address || !burns) {
      return RequestResponse(res, "BadRequest", false, "Missing required parameters");
    }

    try {
      await HandleBurnXPReward(address, burns, Blockchain.Ethereum );
      return RequestResponse(res, "Successful", true, "Burns processed successfully");
    } catch (error) {
      console.error('Error processing burns:', error);
      return RequestResponse(res, "ServerError", false, "Failed to process burns");
    }
  }

  res.setHeader('Allow', ['POST']);
  return RequestResponse(res, "NotImplemented", false, `Method ${req.method} Not Allowed`);
}
