import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, SingleInterface} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetApiHandler} from "../../../../server/api-handler/v1/solana.api-handler";
import { TransactionBuilder } from "@metaplex-foundation/umi";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<TransactionBuilder>>) {
  return RequestApiHandler(req, res, {
    Get: GetApiHandler,
  });
}