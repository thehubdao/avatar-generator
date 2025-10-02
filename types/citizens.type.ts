import { FeatureKind } from "../enums/citizens/common.enum";
import { FeatureInterface } from "../interfaces/api.interface";
import { FeatureClaimableDrop, FeatureDrop } from "../interfaces/citizens.interface";

export const Campaign = {
  Citizens: "vrm_female",
  Creators: "vrm_male",
  Kumi: "kumi",
  Based: "root_citizens",
  Polygon: "polygon_citizens",
}

export type Campaign = typeof Campaign[keyof typeof Campaign]

export const LuksoCampaign = {
  Citizens: Campaign.Citizens,
  Creators: Campaign.Creators,
}

export type LuksoCampaign = typeof LuksoCampaign[keyof typeof LuksoCampaign]

export const SolanaCampaign = {
  Kumi: Campaign.Kumi,
}

export type SolanaCampaign = typeof SolanaCampaign[keyof typeof SolanaCampaign]

export const RootCampaign = {
  Based: Campaign.Based,
}

export type RootCampaign = typeof RootCampaign[keyof typeof RootCampaign]

export const PolygonCampaign = {
  Polygon: Campaign.Polygon,
}

export type PolygonCampaign = typeof PolygonCampaign[keyof typeof PolygonCampaign]

export type AnyFeature =
  | (FeatureInterface & { kind: FeatureKind.Feature })
  | (FeatureDrop & { kind: FeatureKind.Drop })
  | (FeatureClaimableDrop & { kind: FeatureKind.ClaimableDrop });

export type CampaignDrops<T extends Campaign> = Record<T, AnyFeature[]>;