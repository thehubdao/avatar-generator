import {UserInterface} from "../../interfaces/firebase.interface";
import {UserRoleValues} from "../../enums/firebase.enum";
import {ProcessInfo} from "../../server/interfaces/process.interface";

export enum ConvertType {
  UserInterface,
  ProcessInfo,
}

function NewUserInterface(): UserInterface {
  return {
    campaign: [],
    account: '',
    email: '',
    name: '',
    role: UserRoleValues.admin
  };
}

function NewProcessInfo(): ProcessInfo {
  return {
    id: '',
    done: false,
    request: []
  };
}

function GetNewObject(type: ConvertType) {
  switch (type) {
    case ConvertType.UserInterface:
      return NewUserInterface();
    case ConvertType.ProcessInfo:
      return NewProcessInfo();
    default:
      return undefined;
  }
}

export function ConvertObject<TDest>(origin: object, type: ConvertType): TDest {
  const obj = GetNewObject(type);
  if(obj == undefined) return {} as TDest;
  
  const newDest: unknown = Object.fromEntries(
    Object.keys(obj).map(value => [
      value,
      origin[value as keyof object]
    ])
  );
  
  return newDest as TDest;
}