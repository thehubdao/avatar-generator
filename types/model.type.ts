import {Quaternion, SkinnedMesh, Vector3} from "three";
import {TextureTone} from "./texture.type";

export type MaterialFunction = (obj: SkinnedMesh, tone?: TextureTone) => Promise<void>;

export type BoneMatrix = {
  p: Vector3;
  q: Quaternion;
  s: Vector3;
};