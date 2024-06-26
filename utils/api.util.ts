import {
  AnimationInterface,
  ApiResponse,
  EnvMapInterface,
  FeatureInterface,
  SingleInterface,
  StageInterface,
} from "../interfaces/api.interface";
import {LogError} from "./common.util";
import {Result} from "../types/common.type";
import {CommonErrorCode, Module} from "../enums/common.enum";
import {ApiRoutesV1} from "../enums/api.enum";
import { VRM_PROCESS_SERVICE_URL } from "../constants/common.constant";

//#region Generic
type QueryParams = {[p: string]: string | number | undefined | null};
type UriParams = (string | number | undefined)[];

const GET_PARAMS: RequestInit = {
  method: 'GET'
};

function BuildQuery(uris: UriParams, queries: QueryParams) {
  let newUris = '';
  for (const uri of uris) {
    if (uri == undefined) continue;
    
    newUris += `/${uri}`;
  }
  
  const params = new URLSearchParams();
  for (const key of Object.keys(queries)) {
    if (queries[key] == undefined) continue;
    
    params.append(key, queries[key] as string);
  }
  
  return newUris + (params.toString() != '' ? `?${params.toString()}` : '');
}

export async function GetRequest<T>(url: string | ApiRoutesV1, extraUri?: UriParams, query?: QueryParams): Promise<Result<T>> {
  try {
    const extraQuery = BuildQuery(extraUri ?? [], query ?? {});
    const jsonResult = await fetch(url + extraQuery, GET_PARAMS).then(res => res.json()) as ApiResponse<T>;
    if (jsonResult.success && jsonResult.data != undefined)
      return {success: true, value: jsonResult.data};
    else
      return {success: false, errMessage: jsonResult.message, errCode: CommonErrorCode.GetNoData};
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, "Error on get request");
    return {success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError};
  }
}

const POST_PARAMS: RequestInit = {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

export async function PostRequest<T>(url: string, obj?: object): Promise<Result<T>> {
  try {
    const jsonResult = await fetch(url, {
      ...POST_PARAMS,
      body: JSON.stringify(obj)
    }).then(res => {
      return res.json()}) as ApiResponse<T>;
    if (jsonResult.success && jsonResult.data != undefined)
      return {success: true, value: jsonResult.data};
    else
      return {success: false, errMessage: jsonResult.message, errCode: CommonErrorCode.PostNoData};
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, "Error on post request");
    return {success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError};
  }
}

export async function PostRequestVRMProcessFile(VRMFile: Blob): Promise<Blob> {
  try {
    const formData = new FormData()
    formData.append("file", VRMFile)
    // in case, consider to add metadata to the payload
    formData.append("metadata", "vrm-file")
    const response = await fetch(`${VRM_PROCESS_SERVICE_URL}/vrm-process`, { method: "POST", body: formData })
    const processedFile = await response.blob()

    return processedFile
  
  } catch(fail) {
    console.error(fail)

    throw fail
  }
}

//#endregion

export async function GetAssetsListByCampaign(campaign?: string | null) {
  return GetRequest<FeatureInterface[]>(ApiRoutesV1.FeatureOptions, undefined, {campaign});
}

export async function GetAccessoryListByCampaign(campaign?: string | null) {
  return GetRequest<FeatureInterface[]>(ApiRoutesV1.AccessoryOptions, undefined, {campaign});
}

export async function GetAnimationListByCampaign(campaign?: string | null) {
  return GetRequest<AnimationInterface[]>(ApiRoutesV1.Animations, undefined, {campaign});
}

export async function GetAnimationByCampaignAndName(campaign?: string | null, name?: string) {
  return GetRequest<AnimationInterface[]>(ApiRoutesV1.Animations, undefined, {campaign, name});
}

export async function GetStageListByCampaign(campaign?: string | null) {
  return GetRequest<StageInterface[]>(ApiRoutesV1.Stages, undefined, {campaign});
}

export async function GetEnvMapListByCampaign(campaign: string) {
  return GetRequest<EnvMapInterface[]>(ApiRoutesV1.EnvMaps, undefined, {campaign});
}

export async function PostUpdateAdminCampaigns() {
  return PostRequest<void>(ApiRoutesV1.AdminCampaigns);
}

export async function GetAvatarSingleByCampaignCombination(campaign: string, combination?: number) {
  return GetRequest<SingleInterface>(ApiRoutesV1.Single, [campaign, combination]);
}

export async function GetAvatarSingleByCampaignCombinationString(campaign: string, combination?: string) {
  return GetRequest<SingleInterface>(ApiRoutesV1.Single, [campaign, combination]);
}

export async function GetAvatarCombinationByAttributes(campaign: string, attributesBase64: string) {
  return PostRequest<number>(ApiRoutesV1.Single, {campaign, attributes: attributesBase64});
}

export async function RegisterFeaturesDistribution(campaign: string, features: FeatureInterface[]) {
  return PostRequest<{ message: string, success: boolean, data: object }>(ApiRoutesV1.ReportDistribution, { campaign, features })
}