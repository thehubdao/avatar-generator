import {BodyPartTypeEnum} from "../enums/common.enum";

export interface BodyPartLocationApi {
  id: number;
  name: string;
  type: BodyPartTypeEnum;
  url: string;
  thumb: string;
}