import {DefaultApiResponse} from "../server/enums/api.enum";
import {RandomTier} from "../enums/common.enum";

export interface ApiResponse<T> {
  success: boolean,
  message: string | DefaultApiResponse,
  data?: T,
}

export interface AssetInterface {
  index: number;
  name: string;
  type: string;
  path: string;
  thumb?: string;
}

export interface FeatureInterface extends AssetInterface {
  id: string;
  tier: RandomTier;
}

export interface AccessoryInterface extends AssetInterface {
  id: string;
}

export interface AnimationInterface extends Omit<AssetInterface, 'type' | 'index'> {
  id: string;
}

export interface StageInterface extends Omit<AssetInterface, 'type' | 'index'> {
  id: string;
}

export interface EnvMapInterface extends Omit<AssetInterface, 'type' | 'index'>{
  id: string;
}

interface IndexFeatureInterface {
  index: number;
  val: FeatureInterface;
}

export interface SingleInterface {
  random: boolean;
  features: IndexFeatureInterface[];
}

export interface CollectionDataInterface {
  featureIndex: { index: number, name: string }[];
  maxIndex: string;
  maxCombination: number;
}

export interface CollectionDataProcess {
  id: string;
  done: boolean;
}

export interface RandomSet {
  combination: number;
  indexValues?: string;
}