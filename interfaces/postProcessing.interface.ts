import { Vector2 } from "three";
import { PostProcessType } from "../enums/postProcecssing.enum";
import { PostProcessParamsType } from "../types/postProcessing.type";

export interface ConfigPostProcessing {
  type: PostProcessType;
  params: PostProcessParamsType;
}

export interface ConfigUnrealBloomPass {
  resolution: Vector2;
  strength: number;
  radius: number;
  threshold: number;
}