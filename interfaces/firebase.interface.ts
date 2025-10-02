import { Timestamp } from "firebase/firestore";
import {UserRoleValues} from "../enums/firebase.enum";
import { Campaign } from "../types/citizens.type";
import { Blockchain } from "../enums/blockchain/common.enum";
import { FeatureRootDrop } from "./citizens.interface";

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
  wearablesHoldings?: number;
  citizensHoldings?: number;
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

export interface AssetData {
  tokenId: string;
  campaign: Campaign;
  collectionId: string;
  blockchainType: Blockchain;
  baseCombination: string;
  combination: string;
  imageUrl: string;
  name: string;
  description: string;
  attributes: FeatureRootDrop[];
}
