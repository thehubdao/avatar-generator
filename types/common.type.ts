import { Eip1193Provider } from "ethers";
import {CommonErrorCode} from "../enums/common.enum";

declare global {
  interface Window { lukso: Eip1193Provider; }
}

window.lukso = window.lukso || {};

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