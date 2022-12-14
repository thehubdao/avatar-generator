import {AccessoryInterface, AnimationInterface, ApiResponse, FeatureInterface} from "../interfaces/api.interface";
import {LogError} from "./common.util";
import {Result} from "../interfaces/common.interface";
import {Module} from "../enums/common.enum";

const GET_PARAMS: RequestInit = {
  method: 'GET'
};

async function GetRequest<T>(url: string): Promise<Result<T>> {
  try {
    const jsonResult: ApiResponse<T> = await fetch(url, GET_PARAMS).then(res => res.json());
    if (jsonResult.success)
      return {success: true, value: jsonResult.data};
    else
      return {success: false, errMessage: jsonResult.message, value: undefined};
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, "Error on get request");
    return {success: false, errMessage: err.message, value: undefined};
  }
}

const POST_PARAMS: RequestInit = {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

async function PostRequest<T>(url: string, obj?: object): Promise<Result<T>> {
  try {
    const jsonResult: ApiResponse<T> = await fetch(url, {
      ...POST_PARAMS,
      body: JSON.stringify(obj)
    }).then(res => res.json());
    if (jsonResult.success)
      return {success: true, value: jsonResult.data};
    else
      return {success: false, errMessage: jsonResult.message, value: undefined};
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, "Error on post request");
    return {success: false, errMessage: err.message, value: undefined};
  }
}

export async function GetAssetsListByCampaign(campaign?: string | null) {
  return GetRequest<FeatureInterface[]>('/api/getFeatureOptions' + (campaign ? ('?campaign=' + campaign) : ''));
}

export async function GetAccessoryListByCampaign(campaign?: string | null) {
  return GetRequest<AccessoryInterface[]>('/api/getAccessoryOptions' + (campaign ? ('?campaign=' + campaign) : ''));
}

export async function GetAnimationListByCampaign(campaign?: string | null) {
  return GetRequest<AnimationInterface[]>('/api/getAnimations' + (campaign ? ('?campaign=' + campaign) : ''));
}

export async function PostUpdateAdminCampaigns() {
  return PostRequest<void>('api/updateAdminCampaigns');
}