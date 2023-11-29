import {CommonErrorCode} from "../enums/common.enum";

type ResultSuccessful<T> = {
  success: true;
  value: T
}

type ResultFail = {
  success: false;
  errMessage: string;
  errCode: string | CommonErrorCode;
}

export type Result<T> = ResultSuccessful<T> | ResultFail;