import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, CollectionDataInterface} from "../../../../interfaces/api.interface";
import {RequestApiHandler} from "../../../../server/api-handler/request.api-handler";
import {GetUriApiHandler} from "../../../../server/api-handler/v1/collectionData.api-handler";

export default async function Handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<CollectionDataInterface>>) {
  return RequestApiHandler(req, res, {
    Get: GetUriApiHandler
  });
}
