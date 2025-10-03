import { CampaignConstant, LuksoCampaignConstant, RootCampaignConstant, SolanaCampaignConstant, PolygonCampaignConstant } from "../constants/campaign.constant";
import { FeatureKind } from "../enums/citizens/common.enum";
import { FeatureInterface } from "../interfaces/api.interface";
import { FeatureClaimableDrop, FeatureDrop } from "../interfaces/citizens.interface";

export type Campaign = typeof CampaignConstant[keyof typeof CampaignConstant]

export type LuksoCampaign = typeof LuksoCampaignConstant[keyof typeof LuksoCampaignConstant]

export type SolanaCampaign = typeof SolanaCampaignConstant[keyof typeof SolanaCampaignConstant]

export type RootCampaign = typeof RootCampaignConstant[keyof typeof RootCampaignConstant]

export type PolygonCampaign = typeof PolygonCampaignConstant[keyof typeof PolygonCampaignConstant]

export type AnyFeature =
  | (FeatureInterface & { kind: FeatureKind.Feature })
  | (FeatureDrop & { kind: FeatureKind.Drop })
  | (FeatureClaimableDrop & { kind: FeatureKind.ClaimableDrop });

export type CampaignDrops<T extends Campaign> = Record<T, AnyFeature[]>;