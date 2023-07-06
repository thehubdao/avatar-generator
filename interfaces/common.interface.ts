import {Object3D} from "three";
import {ClientQuestion} from "../enums/campaign.enum";
import {AdminComponents} from "../enums/common.enum";
import {ChangeMaterialOption} from "../enums/model.enum";
import {ConfigLight} from "./light.interface";
import { AccessoryInterface, AnimationInterface,  EnvMapInterface,  FeatureInterface, StageInterface } from "./api.interface";

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
  defStart?: number;
  defEyesColor?: string;
  defSkinColor?: string;
  defSkin?: string;
  defCam?: LookAtVectors;
  defBg?: string;
  lights?: ConfigLight[],
  defAnimation?: string;
  defStage?: string;
  defEnvMap?: string;
  featuresCamPos?: Record<string, LookAtVectors>;
  accCamPos?: Record<string, LookAtVectors>;
}

/***
 * Update CampaignParameterName enum as well, when changing names on this interface
  */
export interface CampaignParameters {
  owner: string;
  armature: string;
  features?: FeatureBasic[];
  accessories?: BasicData[];
  config?: CampaignConfig;
}

export interface CampaignAssets {
  features: FeatureInterface[],
  accessories: AccessoryInterface[],
  animations: AnimationInterface[],
  stages: StageInterface[],
  env_maps: EnvMapInterface[]
}

export interface FeatureBasic extends Omit<BasicData, 'detail'> {
  index: number,
  hasCustomIcon: boolean,
  iconUrl: string,
  isMulticolor: boolean
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

export interface SocialMediaDataProps {
  link: string;
  icon: React.ReactNode;
}