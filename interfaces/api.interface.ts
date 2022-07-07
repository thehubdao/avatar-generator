import {AccessoryPartTypeEnum, BodyPartTypeEnum} from "../enums/common.enum";

export interface BodyPartLocationApi {
  id: string;
  name: string;
  type: BodyPartTypeEnum;
  url: string;
  thumb: string;
  campaign: string[];
}

export interface AccLocationApi {
  id: string;
  name: string;
  type: AccessoryPartTypeEnum;
  path: string;
  thumb: string;
  campaign: string[];
}