import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { RequestResponse } from "../request.api-handler";
import { DefaultApiResponse } from "../../enums/api.enum";
import { LogError } from "../../../utils/common.util";
import { Module } from "../../../enums/common.enum";
import { ObjectManager } from "@filebase/sdk";

const pinManager = new ObjectManager(
  process.env.NEXT_PUBLIC_FILEBASE_BUCKET_KEY,    
  process.env.NEXT_PUBLIC_FILEBASE_BUCKET_SECRET,
  {bucket:process.env.NEXT_PUBLIC_FILEBASE_BUCKET_NAME}
);

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<{ cid: string }>>) {
  if (req.method !== 'POST') {
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.BadRequest);
  }

  try {
    const { campaign, tokenMetadata } = req.body;
    const metadata = await pinManager.upload(
      `${campaign}_metadata_#${tokenMetadata.tokenId}`,
      Buffer.from(JSON.stringify({LSP4Metadata:tokenMetadata})),
      {},
      {}
    );
    return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess, { cid: metadata.cid });
  } catch (error) {
    const err = error as Error;
    void LogError(Module.ApiUtil, `Error uploading metadata: ${err.message}`, error);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}