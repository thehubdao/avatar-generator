import {UserInterface} from "../../interfaces/firebase.interface";
import {UserRoleValues} from "../../enums/firebase.enum";

export enum ConvertType {
  UserInterface,
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

function GetNewObject<T>(type: ConvertType) {
  switch (type) {
    case ConvertType.UserInterface:
      return NewUserInterface();
    default:
      return undefined;
  }
}

export function ConvertObject<TDest>(origin: object, type: ConvertType): TDest {
  const obj = GetNewObject<TDest>(type);
  if(obj == undefined) return {} as TDest;
  
  const newDest: unknown = Object.fromEntries(
    Object.keys(obj).map(value => [
      value,
      origin[value as keyof object]
    ])
  );
  
  return newDest as TDest;
}