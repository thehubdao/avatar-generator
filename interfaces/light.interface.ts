import {LightType} from "../enums/light.enum";
import {AGVector3} from "./common.interface";

export interface ConfigLight {
  type: LightType;
  params: LightParams;
}

interface LightParams {
  color?: string,
  intst?: number,
  dist?: number,
  decay?: number,
  width?: number,
  height?: number,
  pos?: AGVector3,
  lAt?: AGVector3,
}