import {BufferGeometry, Object3D, SkinnedMesh} from "three";

export interface BasicData {
  id: string,
  value: string,
}

export interface PartInfoInterface {
  partIndex: number;
  featureBase?: Object3D;
}

export interface AccessoryInfoInterface {
  bone: Object3D;
  hasIt?: boolean;
  accessoryRef?: Object3D;
  accessoryIndex?: number;
}