import {
  AccessoryInterface,
  AnimationInterface,
  ApiResponse,
  EnvironmentInterface,
  FeatureInterface,
  SingleInterface,
} from "../interfaces/api.interface";
import {LogError} from "./common.util";
import {Result} from "../interfaces/common.interface";
import {Module} from "../enums/common.enum";
import {ApiRoutesV1} from "../enums/api.enum";

//#region Generic
const GET_PARAMS: RequestInit = {
  method: 'GET'
};

async function GetRequest<T>(url: string | ApiRoutesV1, query?: string): Promise<Result<T>> {
  try {
    const jsonResult: ApiResponse<T> = await fetch(url + (query ?? ''), GET_PARAMS).then(res => res.json());
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

//#endregion

export async function GetAssetsListByCampaign(campaign?: string | null) {
  return GetRequest<FeatureInterface[]>(ApiRoutesV1.FeatureOptions,campaign ? ('?campaign=' + campaign) : undefined);
}

export async function GetAccessoryListByCampaign(campaign?: string | null) {
  return GetRequest<AccessoryInterface[]>(ApiRoutesV1.AccessoryOptions, campaign ? ('?campaign=' + campaign) : undefined);
}

export async function GetAnimationListByCampaign(campaign?: string | null) {
  return GetRequest<AnimationInterface[]>(ApiRoutesV1.Animations, campaign ? ('?campaign=' + campaign) : undefined);
}

export async function GetEnvironmentListByCampaign(campaign?: string | null) {
  return GetRequest<EnvironmentInterface[]>(ApiRoutesV1.Environments, campaign ? ('?campaign=' + campaign) : undefined);
}

export async function PostUpdateAdminCampaigns() {
  return PostRequest<void>(ApiRoutesV1.AdminCampaigns);
}

export async function GetAvatarSingleByCampaignCombination(campaign: string, combination?: number) {
  return GetRequest<SingleInterface>(ApiRoutesV1.Single, `/${campaign}/${combination}`);
}