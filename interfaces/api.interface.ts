import {DefaultApiResponses} from "../enums/api.enum";

export interface ApiResponse<T> {
  success: boolean,
  message: string | DefaultApiResponses,
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
}

export interface AccessoryInterface extends AssetInterface {
  id: string;
}

export interface AnimationInterface extends Omit<AssetInterface, 'type' | 'index'> {
  id: string;
}

export interface EnvironmentInterface extends Omit<AssetInterface, 'type' | 'index'> {
  id: string;
}