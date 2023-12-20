import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../interfaces/api.interface";

export interface RequestHandler<TGet, TPost, TPut, TDelete> {
  Get?: RequestFunction<TGet>,
  Post?: RequestFunction<TPost>,
  Put?: RequestFunction<TPut>,
  Delete?: RequestFunction<TDelete>,
}

type RequestFunction<T> = (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => Promise<void>;