import { CampaignParameterName } from "../enums/common.enum";
import { FirestoreParameters } from "../enums/firebase.enum";

export type ParameterNameType =
  FirestoreParameters | CampaignParameterName;

export interface Notification {
  id: string;
  title: string;
  points: number;
  time: string;
  message: string;
  imageUrl:string;
}