import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../interfaces/api.interface";
import {RequestHandler} from "../interfaces/api-handler.interface";
import {RequestMessage, RequestStatus} from "../types/api.type";
import {REQUEST_STATUS, REQUEST_METHOD} from "../constants/api.constant";
import {DefaultApiResponse} from "../enums/api.enum";

export async function RequestApiHandler<TGet, TPost, TPut, TDelete>(req: NextApiRequest, res: NextApiResponse<ApiResponse<TGet | TPost | TPut | TDelete>>, requests: RequestHandler<TGet, TPost, TPut, TDelete>) {
  switch (req.method) {
    case REQUEST_METHOD.Get:
      if (requests.Get == undefined)
        return BadRequestResponse(res);
      
      return requests.Get(req, res);
    case REQUEST_METHOD.Post:
      if (requests.Post == undefined)
        return BadRequestResponse(res);
      
      return requests.Post(req, res);
    case REQUEST_METHOD.Put:
      if (requests.Put == undefined)
        return BadRequestResponse(res);
      
      return requests.Put(req, res);
    case REQUEST_METHOD.Delete:
      if (requests.Delete == undefined)
        return BadRequestResponse(res);
      
      return requests.Delete(req, res);
    default:
      return BadRequestResponse(res);
  }
}

export function RequestResponse<T>(res: NextApiResponse<ApiResponse<T>>,
                                   status: RequestStatus,
                                   success: boolean,
                                   message: RequestMessage,
                                   data?: T) {
  return res
    .status(REQUEST_STATUS[status])
    .json({
      success,
      message,
      data
    })
}

function BadRequestResponse<T>(res: NextApiResponse<ApiResponse<T>>) {
  return RequestResponse(res, "BadRequest", false, DefaultApiResponse.BadRequest);
}