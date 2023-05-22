import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../interfaces/api.interface";

export interface RequestHandler<T> {
  Get?: RequestFunction<T>,
  Post?: RequestFunction<T>,
  Put?: RequestFunction<T>,
  Delete?: RequestFunction<T>,
}

type RequestFunction<T> = (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => Promise<void>;