import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../interfaces/api.interface";
import { DefaultApiResponse } from "../../enums/api.enum";
import { RequestResponse } from "../request.api-handler";


export async function  PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
    const data = req.body;
  
    if (!data)
      return RequestResponse(res, "BadRequest", false,  DefaultApiResponse.MissingInfo);

    console.log(data);
    
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }