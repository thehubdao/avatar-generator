import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { DefaultApiResponse } from "../../enums/api.enum";
import { RequestResponse } from "../request.api-handler";
import { UpdateRootAsset } from "../../../utils/web3/root/registry.util";


export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
    const {data} = req.body;
    const {events} = data;
    const event = events[0];
    const [,,,, collectionId, tokenId] = event.args[1].split(':');
  
    if (!data)
      return RequestResponse(res, "BadRequest", false,  DefaultApiResponse.MissingInfo);

    const updateRootAssetResult = await UpdateRootAsset(event.args[0], collectionId, tokenId);

    if (!updateRootAssetResult.success) return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);

    return RequestResponse(res, "Successful", true, DefaultApiResponse.PostSuccess);
    
  }