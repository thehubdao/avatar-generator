import { NextApiRequest, NextApiResponse } from 'next';
import { ApproveClaimForUser } from '../../../../utils/web3/drops.util';
import { ApiResponse } from '../../../../interfaces/api.interface';
import { RequestResponse } from '../../../../server/api-handler/request.api-handler';
import { Drop } from '../../../../interfaces/citizens.interface';
import { GetClaimableDrops } from '../../../../utils/firebase.util';

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<Drop[] | { approved: boolean }>>) {
  const { method, query, body } = req;

  switch (method) {
    case 'GET':
      return HandleGetDrops(query.id as string | undefined, res);
    case 'POST':
      return HandleApproveClaim(body, res);
    default:
      return RequestResponse(res, "NotFound", false, "Method Not Allowed");
  }
}

async function HandleGetDrops(dropId: string | undefined, res: NextApiResponse<ApiResponse<Drop[]>>) {
  try {
    const drops = await GetClaimableDrops(dropId);
    return RequestResponse(res, "Successful", true, "", drops);
  } catch (error) {
    console.error('Error fetching drops:', error);
    return RequestResponse(res, "ServerError", false, "Internal Server Error");
  }
}

async function HandleApproveClaim(body: NextApiRequest['body'], res: NextApiResponse<ApiResponse<{ approved: boolean }>>) {
  const { address, dropId } = body;

  if (!address || typeof address !== 'string' || !dropId || typeof dropId !== 'string') {
    return RequestResponse(res, "BadRequest", false, "Invalid parameters");
  }

  try {
    const isApproved = await ApproveClaimForUser(address, dropId);
    return RequestResponse(res, "Successful", true, "", { approved: isApproved });
  } catch (error) {
    console.error('Error approving claim:', error);
    return RequestResponse(res, "ServerError", false, "Internal Server Error");
  }
}
