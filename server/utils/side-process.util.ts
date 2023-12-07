import {GetSingleDocument, InsertDocWithId, UpdateDocObject} from "../../utils/firebase.util";
import {FirestoreGlobalLocation} from "../../enums/firebase.enum";
import {ProcessInfo} from "../interfaces/process.interface";
import {Result} from "../../types/common.type";
import {Delay, TryAgainTimes} from "../../utils/common.util";
import {CommonErrorCode} from "../../enums/common.enum";
import {ConvertObject, ConvertType} from "../../utils/common/object-converter.util";

class SideProcessUtil {
  private static _instance: SideProcessUtil;
  private readonly _processQueue: Map<string, ProcessInfo>;

  constructor() {
    this._processQueue = new Map();
  }
  
  public static Instance() {
    if (SideProcessUtil._instance === undefined)
      SideProcessUtil._instance = new SideProcessUtil();

    return SideProcessUtil._instance;
  }

  public async GetProcess(processId: string): Promise<Result<ProcessInfo>> {
    const sessionProcess = this._processQueue.get(processId);
    if (sessionProcess != undefined)
      return {success: true, value: sessionProcess};

    return GetSingleDocument<ProcessInfo>(FirestoreGlobalLocation.Process, processId);
  }
  
  public SetProcess(process: ProcessInfo) {
    this._processQueue.set(process.id, process);
  }
}

export async function GenerateProcessId() {
  const {uuidv4} = await import('@firebase/util');
  return uuidv4();
}

export async function CreateProcess(request: string[]) {
  const processId = await GenerateProcessId();
  const newProcess: ProcessInfo = {
    id: processId,
    done: false,
    canUpdate: true,
    request
  };
  SideProcessUtil.Instance().SetProcess(newProcess);

  await Delay(500);
  await TryAgainTimes(3, async () => {
    const findProcess = await SideProcessUtil.Instance().GetProcess(processId);
    if (!findProcess.success) return false;
    
    const cleanProcess = ConvertObject<ProcessInfo>(findProcess.value, ConvertType.ProcessInfo);
    const createResult = await InsertDocWithId(processId, cleanProcess, FirestoreGlobalLocation.Process);
    if (!createResult.success) return false;

    findProcess.value.canUpdate = false;
    SideProcessUtil.Instance().SetProcess(findProcess.value);
    return true;
  });
  
  return processId;
}

export async function SetProcessDone(processId: string): Promise<Result<boolean>> {
  const processResult = await SideProcessUtil.Instance().GetProcess(processId);
  if (!processResult.success)
    return {success: false, errMessage: "No process found!", errCode: CommonErrorCode.GetNoData};

  const process = processResult.value;
  if (process.canUpdate) {
    process.done = true;
    SideProcessUtil.Instance().SetProcess(process);
    return {success: true, value: true};
  } else {
    process.done = true;
    SideProcessUtil.Instance().SetProcess(process);
    
    const doneProcess: Partial<ProcessInfo> = {done: true};
    return UpdateDocObject(FirestoreGlobalLocation.Process, doneProcess, undefined, processId);
  }
}