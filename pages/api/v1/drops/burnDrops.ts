import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../../interfaces/api.interface";
import { RequestApiHandler } from "../../../../server/api-handler/request.api-handler";
import { PostBurnDropsApiHandler } from "../../../../server/api-handler/v1/drops.api-handler";
import { DropToClaim } from "../../../../interfaces/citizens.interface";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<DropToClaim[] | boolean>>) {
    return RequestApiHandler(req, res, {
        Post: PostBurnDropsApiHandler,
    });
}