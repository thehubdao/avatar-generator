import { NextApiRequest, NextApiResponse } from 'next';
import { ApproveClaimForUser } from '../../../utils/web3/drops.util';
import { ApiResponse } from '../../../interfaces/api.interface';
import {RequestResponse} from '../request.api-handler'
import { DataBaseDrop } from '../../../interfaces/citizens.interface';

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<DataBaseDrop[] | { approved: boolean }>>) {
  const { method, body } = req;

  switch (method) {
    case 'POST':
      return HandleApproveClaim(body, res);
    default:
      return RequestResponse(res, "NotFound", false, "Method Not Allowed");
  }
}

async function HandleApproveClaim(body: NextApiRequest['body'], res: NextApiResponse<ApiResponse<{ approved: boolean }>>) {
  const { address, dropId } = body;

  if (!address || typeof address !== 'string' || !dropId || typeof dropId !== 'string') {
        return RequestResponse(res, "BadRequest", false, "Invalid parameters");
  }

  try {
    const isApproved = await ApproveClaimForUser(address, dropId);
    return RequestResponse(res, "Successful", true, JSON.stringify({ approved: isApproved }));
  } catch (error) {
    console.error('Error approving claim:', error);
        return RequestResponse(res, "ServerError", false, "Internal Server Error");
  }
}

