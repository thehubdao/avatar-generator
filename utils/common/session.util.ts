import {UserInterface} from "../../interfaces/firebase.interface";
import {GetInfoDB, GetUserInfo} from "../firebase.util";
import {AccessoryInterface, AnimationInterface, FeatureInterface} from "../../interfaces/api.interface";
import {FirestoreLocation} from "../../enums/firebase.enum";

enum SessionConstant {
  UserInfo,
  DBInfo,
}

interface SessionRequest {
  sessionId: SessionConstant;
  params?: any[];
}

class SessionUtil {
  private static _instance: SessionUtil;
  private _dataMap: Map<string, any> | null;

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
      this._dataMap = new Map<string, any>();
    }

    return this._dataMap;
  }
}

function keyToString(request: SessionRequest) {
  const arrayToString = JSON.stringify(request.params);
  return `${request.sessionId}-${arrayToString}`;
}

async function GetData<T>(key: SessionConstant, findData: () => Promise<T | undefined>, ...params: any[]): Promise<T | undefined> {
  const data = SessionUtil.Instance().Data();

  const request: SessionRequest = {
    sessionId: key,
    params
  };
  const leKey = keyToString(request);
  
  let datum = data.get(leKey);
  if (datum == undefined) {
    const value = await findData();
    data.set(leKey, value);
    datum = value;
  }

  return datum as T;
}

async function GetAndReplaceData<T>(key: SessionConstant, replaceData: (prev?: T) => Promise<T>, ...params: any[]) {
  const data = SessionUtil.Instance().Data();
  
  const request: SessionRequest = {
    sessionId: key,
    params
  };
  const leKey = keyToString(request);
  let datum = data.get(leKey);
  
  const value = await replaceData(datum);
  data.set(leKey, value);
  
  if (datum == undefined)
    datum = value;

  return datum as T;
}

export async function SessionUserInfo(userUID: string) {
  return GetData<UserInterface>(SessionConstant.UserInfo, async () => GetUserInfo(userUID), userUID);
}

export async function SessionDBInfo(location: FirestoreLocation, campaign?: string) {
  return GetData(SessionConstant.DBInfo,
    () => GetInfoDB<FeatureInterface | AccessoryInterface | AnimationInterface>(location, campaign),
    location, campaign);
}