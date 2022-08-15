export interface BodyPartLocationApi extends FeatureLocationApi {
  id: string;
}

export interface AccLocationApi extends FeatureLocationApi {
  id: string;
}

export interface FeatureLocationApi {
  name: string;
  type: string;
  path: string;
  thumb: string;
  campaign: string[];
}