import {REQUEST_METHOD, REQUEST_STATUS} from "../constants/api.constant";
import {DefaultApiResponse} from "../enums/api.enum";

export type RequestMessage = string | DefaultApiResponse;

export type RequestStatus = keyof typeof REQUEST_STATUS;

export type RequestMethod = keyof typeof REQUEST_METHOD;