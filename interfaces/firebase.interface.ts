import {UserRoleValues} from "../enums/firebase.enum";
import {CollectionStatus} from "../server/enums/collection.enum";

export interface AGQueryConstraints {
  campaign?: string;
  type?: string;
  name?: string;
  collectionStatus?: CollectionStatus;
}

export interface LogInInterface {
  user: string;
  pass: string;
}

export interface UserInterface {
  role: UserRoleValues;
  name: string;
  account: string;
  email: string;
  campaign: string[];
}

export interface AdminUser extends  UserInterface {
  lastUpdate: number;
}

export interface UserWithPass extends UserInterface{
  password: string;
}

export interface AGParameters {
  campaigns: string[],
}