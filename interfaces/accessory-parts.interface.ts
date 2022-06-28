import {Object3D} from "three";

export interface AccessoryInfoInterface {
  bone: Object3D;
  hasIt?: boolean;
  accessoryRef?: Object3D;
  accessoryIndex?: number;
}