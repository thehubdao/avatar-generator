import {UserRoleValues} from "../enums/firebase.enum";

export interface AGQueryConstraints {
  campaign?: string;
  type?: string;
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

export interface UserWithPass extends UserInterface{
  password: string;
}