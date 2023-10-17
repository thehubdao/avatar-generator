import { Vector2 } from "three";

export interface ConfigUnrealBloomPass {
  resolution: Vector2;
  strength: number;
  radius: number;
  threshold: number;
}