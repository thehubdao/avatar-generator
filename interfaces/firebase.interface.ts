import { Timestamp } from "firebase/firestore";
import {UserRoleValues} from "../enums/firebase.enum";

export interface AGQueryConstraints {
  campaign?: string;
  type?: string;
  name?: string;
}

export interface LogInInterface {
  user: string;
  pass: string;
}

export interface UserInterface {
  lastRecordedWearables?: number;
  followerCount?: number;
  followingCount?: number;
  loginStreak?: number;
  lastLogin?: Timestamp;
  role: UserRoleValues;
  name: string;
  account: string;
  email: string;
  campaign: string[];
  xp?: number;
  level?: number;
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