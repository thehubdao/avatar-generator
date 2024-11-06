import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { RequestResponse } from "../request.api-handler";
import { DefaultApiResponse } from "../../enums/api.enum";
import { GenerateSessionToken } from "../../../utils/firebase.util";

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string>>) {
  const { address, message, signature } = req.body;

  if (!address || !message || !signature) {
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
  }

  try {
    const token = await GenerateSessionToken(address);

    // Set the token as an HTTP-only cookie
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);

    return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess, "Authentication successful");
  } catch (error) {
    console.error('Verification error:', error);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}