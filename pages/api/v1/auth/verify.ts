import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../../interfaces/api.interface';
import { RequestApiHandler } from '../../../../server/api-handler/request.api-handler';
import { PostApiHandler } from '../../../../server/api-handler/v1/auth.api-handler';

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string | { xp: number; level: number; nextLevelXP: number; }>>) {
  return RequestApiHandler(req, res, {
    Post: PostApiHandler,
  });
}
