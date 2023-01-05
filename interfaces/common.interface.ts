import {Object3D} from "three";
import {ClientQuestion} from "../enums/campaign.enum";

export interface BasicData {
  id: string;
  val: string;
  detail?: string;
}

export interface PartInfoInterface {
  partIndex: number;
  featureBase?: Object3D;
}

export interface AccessoryInfoInterface {
  accessoryIndex: number;
  accessoryRef?: Object3D;
}

export interface ExportInterface {
  attributes: BasicData[];
  attributesBase64?: string;
  picture?: Blob;
  model?: Blob;
}

export interface LookAtVectors {
  lookAt?: AGVector3;
  pos?: AGVector3;
}

interface AGVector3 {
  x: number;
  y: number;
  z: number;
}

export interface CampaignConfig {
  clientRequirements?: ClientQuestion[],
  defEyesColor?: string;
  defSkinColor?: string;
  defCam?: LookAtVectors,
  partsCamPos?: Record<string, LookAtVectors>;
  accCamPos?: Record<string, LookAtVectors>;
}