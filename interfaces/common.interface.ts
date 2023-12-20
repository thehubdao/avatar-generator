import { Object3D } from "three";
import { ClientQuestion } from "../enums/campaign.enum";
import {AdminComponents, RandomTier} from "../enums/common.enum";
import { ChangeMaterialOption } from "../enums/model.enum";
import { ConfigLight } from "./light.interface";
import { UserInterface } from "./firebase.interface";
import { AccessoryInterface, AnimationInterface, EnvMapInterface, FeatureInterface, StageInterface } from "./api.interface";
import { ConfigEnvMap } from "./envMap.interface";
import { ConfigShadow } from "./shadow.interface";
import { ReactNode } from "react";
import { ConfigPostProcessing } from "./postProcessing.interface";
import {ModelExtension} from "../enums/export.enum";

export interface BasicData {
  id: string;
  val: string;
  detail?: string;
}

export interface FeatureInfoInterface {
  index: number;
  name: string;
  ref?: Object3D;
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
  combination?: number;
}

// TODO: place it in a better place, maybe create a new file for color interfaces
export interface ColorConfig {
  materialName?: string;
  defColor?: string;
  colorPalette?: string[];
  usePalette?: boolean;
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
  changeMaterial?: ChangeMaterialOption;
  defAvatarCombination?: number;
  defBg?: string;
  defCam?: LookAtVectors;
  defShadow?: ConfigShadow;
  defAnimation?: string;
  defStage?: string;
  lights?: ConfigLight[],
  envMap?: ConfigEnvMap,
  skin?: ColorConfig;
  featuresCamPos?: Record<string, LookAtVectors>;
  accCamPos?: Record<string, LookAtVectors>;
  featuresSkin?: Record<string, ColorConfig>;
  accSkin?: Record<string, ColorConfig>;
  postProcessing?: ConfigPostProcessing[];
  extraExport?: ModelExtension[];
}



/***
 * Update CampaignParameterName enum as well, when changing names on this interface
  */
export interface CampaignParameters {
  owner: string;
  armature: string;
  features?: FeatureBasic[];
  accessories?: FeatureBasic[];
  config: CampaignConfig;
  r_val?: Record<RandomTier, number>;
}

export interface CampaignAssets {
  features: FeatureInterface[],
  accessories: AccessoryInterface[],
  animations: AnimationInterface[],
  stages: StageInterface[],
  env_maps: EnvMapInterface[]
}

export interface FeatureBasic {
  meshName: string,
  displayName: string,
  index: number,
  hasCustomIcon: boolean,
  iconUrl: string,
  isMulticolor: boolean
}

export interface AdminComponentParams {
  docLocation?: string;
}

export type ChangeComponentFunction = (newComponent: AdminComponents, params?: AdminComponentParams) => void;

export interface ObjProp {
  prop: string;
}

export interface AuthStateInterface {
  connected: boolean;
  address?: string;
  userInfo?: UserInterface;
}

export interface SocialMediaDataProps {
  link: string;
  icon: ReactNode;
}