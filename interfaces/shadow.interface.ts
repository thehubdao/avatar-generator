import { ShadowType } from "../enums/shadow.enum";
import { AGVector3 } from "./common.interface";

export interface ConfigShadow {
  type: ShadowType;
  lightPos: AGVector3;
  shadowSize: number;
}