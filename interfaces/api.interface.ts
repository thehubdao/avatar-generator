import {BodyPartTypeEnum} from "../enums/common.enum";

export interface BodyPartLocationApi {
  id: string;
  name: string;
  type: BodyPartTypeEnum;
  url: string;
  thumb: string;
  campaign: string[];
}