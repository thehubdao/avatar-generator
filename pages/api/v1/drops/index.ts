import { NextApiRequest, NextApiResponse } from 'next';
import { ApproveClaimForUser } from '../../../../utils/web3/drops.util[deprecated]';
import { ApiResponse } from '../../../../interfaces/api.interface';
import { RequestResponse } from '../../../../server/api-handler/request.api-handler';
import { ClaimableDrop } from '../../../../interfaces/citizens.interface';

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<ClaimableDrop[] | { approved: boolean }>>) {
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
    const isApproved = await ApproveClaimForUser();
    return RequestResponse(res, "Successful", true, "", { approved: isApproved });
  } catch (error) {
    console.error('Error approving claim:', error);
    return RequestResponse(res, "ServerError", false, "Internal Server Error");
  }
}
