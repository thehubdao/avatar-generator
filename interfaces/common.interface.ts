import {Object3D} from "three";
import {ClientQuestion} from "../enums/campaign.enum";
import {AdminComponents} from "../enums/common.enum";

export interface BasicData {
  id: string;
  val: string;
  detail?: string;
}

export interface FeatureInfoInterface {
  featureIndex: number;
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

export interface AGVector3 {
  x: number;
  y: number;
  z: number;
}

export interface CampaignConfig {
  clientRequirements?: ClientQuestion[];
  defEyesColor?: string;
  defSkinColor?: string;
  defCam?: LookAtVectors;
  defAnimation?: string;
  featuresCamPos?: Record<string, LookAtVectors>;
  accCamPos?: Record<string, LookAtVectors>;
}

/***
 * Update CampaignParameterName enum as well, when changing names on this interface
  */
export interface CampaignParameters {
  owner: string;
  armature: string;
  features?: BasicData[];
  accessories?: BasicData[];
  config?: CampaignConfig;
}

export interface AdminComponentParams {
  docLocation?: string;
}

export type ChangeComponentFunction = (newComponent: AdminComponents, params?: AdminComponentParams) => void;

export interface Result<T> {
  success: boolean;
  value?: T;
  errMessage?: string;
  errCode?: string;
}

export interface ObjProp {
  prop: string;
}