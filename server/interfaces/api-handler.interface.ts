import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../interfaces/api.interface";

export interface RequestHandler<T, U, V, W> {
  Get?: RequestFunction<T>,
  Post?: RequestFunction<U>,
  Put?: RequestFunction<V>,
  Delete?: RequestFunction<W>,
}

type RequestFunction<T> = (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => Promise<void>;