import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import { ApiResponse } from '../../../../interfaces/api.interface';
import { RequestApiHandler, RequestResponse } from '../../../../server/api-handler/request.api-handler';
import { DefaultApiResponse } from '../../../../server/enums/api.enum';
import { GenerateSessionToken } from '../../../../utils/firebase.util';

type VerifyResponse = {
  GET: boolean;
  POST: {
    sessionToken: string;
  };
};

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<VerifyResponse['POST']>>) {
  const { address, message, signature } = req.body;

  if (!address || !message || !signature) {
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
  }

  try {
    const token = await GenerateSessionToken(address, message, signature);
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=21600; SameSite=Strict`); // 6 horas
    return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess, { sessionToken: token });
  } catch (error) {
    console.error('Verification error:', error);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<VerifyResponse['GET']>>) {
  const token = req.cookies.session;

  if (!token) {
    return RequestResponse(res, "Unauthorized", false, DefaultApiResponse.Unauthorized);
  }

  try {
    verify(token, process.env.JWT_SECRET as string);
    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess);
  } catch (error) {
    return RequestResponse(res, "Unauthorized", false, DefaultApiResponse.Unauthorized);
  }
}

export default async function Handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<VerifyResponse[keyof VerifyResponse]>>
) {
  return RequestApiHandler(req, res, {
    Post: PostApiHandler,
    Get: GetApiHandler
  });
}
