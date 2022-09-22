import {UserRoleValues} from "../enums/firebase.enum";

export interface AGQueryConstraints {
  campaign?: string;
  type?: string
}

export interface LogInInterface {
  user: string;
  pass: string;
}

export interface UserInterface {
  role: UserRoleValues,
  name: string,
  email: string,
  campaign: string[],
}