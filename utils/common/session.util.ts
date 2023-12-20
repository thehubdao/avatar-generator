import {UserInterface} from "../../interfaces/firebase.interface";
import {GetInfoDB, GetParameter, GetUserInfo} from "../firebase.util";
import {AccessoryInterface, AnimationInterface, FeatureInterface} from "../../interfaces/api.interface";
import {FirestoreLocation} from "../../enums/firebase.enum";
import {BasicData} from "../../interfaces/common.interface";
import {CampaignParameterName} from "../../enums/common.enum";

enum SessionConstant {
  UserInfo,
  DBInfo,
  Parameter,
  TextureTone,
}

interface SessionRequest {
  sessionId: SessionConstant;
  params?: (string | number | undefined)[];
}

class SessionUtil {
  private static _instance: SessionUtil;
  private _dataMap: Map<string, unknown> | null;

  constructor() {
    this._dataMap = null;
  }

  public static Instance() {
    if (SessionUtil._instance === undefined)
      SessionUtil._instance = new SessionUtil();

    return SessionUtil._instance;
  }

  public Data() {
    if (this._dataMap == null) {
      this._dataMap = new Map<string, unknown>();
    }

    return this._dataMap;
  }
}

function KeyToString(request: SessionRequest) {
  const arrayToString = JSON.stringify(request.params);
  return `${request.sessionId}-${arrayToString}`;
}

async function GetData<T>(forceUpdate: boolean, key: SessionConstant, findData: () => Promise<T | undefined>, ...params: (string | number | undefined)[]): Promise<T | undefined> {
  const storage = SessionUtil.Instance().Data();

  const request: SessionRequest = {
    sessionId: key,
    params
  };
  const leKey = KeyToString(request);
  
  let datum = storage.get(leKey);
  if (datum == undefined || forceUpdate) {
    const value = await findData();
    storage.set(leKey, value);
    datum = value;
  }

  return datum as T;
}

export function SessionUserInfo(userUID: string, forceUpdate = false) {
  return GetData<UserInterface>(forceUpdate, SessionConstant.UserInfo, async () => GetUserInfo(userUID), userUID);
}

export function SessionDBInfo(location: FirestoreLocation, campaign: string | undefined, forceUpdate = false) {
  return GetData(forceUpdate, SessionConstant.DBInfo,
    () => GetInfoDB<FeatureInterface | AccessoryInterface | AnimationInterface>(location, campaign),
    location, campaign);
}

export function SessionCampaignParameter(campaign: string | undefined, param: CampaignParameterName, forceUpdate = false) {
  return GetData(forceUpdate, SessionConstant.Parameter, () => GetParameter<BasicData[]>(campaign, param),
    campaign, param);
}