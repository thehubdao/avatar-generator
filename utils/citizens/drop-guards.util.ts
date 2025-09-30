import { FeatureInterface } from "../../interfaces/api.interface";
import { FeatureDrop, LuksoDrop, PolygonDrop, RootDrop, FeatureClaimableDrop } from "../../interfaces/citizens.interface";

/**
 * Type guards for discriminating drop types from unified FeatureInterface
 */

export function isDrop(feature: FeatureInterface): feature is FeatureDrop {
  return !!(feature as any).isDrop || !!(feature as any).contractAddress;
}

export function isClaimableDrop(feature: FeatureInterface): feature is FeatureClaimableDrop {
  return !!(feature as any).isClaimableDrop || (typeof (feature as any).price === 'number');
}

export function isLuksoDrop(feature: FeatureInterface): feature is LuksoDrop {
  return isDrop(feature) && (feature as any).dropType !== undefined;
}

export function isPolygonDrop(feature: FeatureInterface): feature is PolygonDrop {
  return isDrop(feature) && typeof (feature as any).tokenId === 'number';
}

export function isRootDrop(feature: FeatureInterface): feature is RootDrop {
  return isDrop(feature) && !!(feature as any).collectionId && !!(feature as any).schemaPart;
}

/**
 * Filter helpers
 */

export function filterDrops<T extends FeatureInterface = FeatureDrop>(features: FeatureInterface[]): T[] {
  return features.filter(isDrop) as T[];
}

export function filterClaimableDrops(features: FeatureInterface[]): FeatureClaimableDrop[] {
  return features.filter(isClaimableDrop) as FeatureClaimableDrop[];
}

export function filterBaseFeatures(features: FeatureInterface[]): FeatureInterface[] {
  return features.filter(f => !isDrop(f));
}

/**
 * Conversion helpers (for backward compatibility if needed)
 */

export function featureToDropIfApplicable(feature: FeatureInterface): FeatureDrop | FeatureInterface {
  if (isDrop(feature)) {
    return feature as FeatureDrop;
  }
  return feature;
}

export function featureToClaimableIfApplicable(feature: FeatureInterface): FeatureClaimableDrop | FeatureInterface {
  if (isClaimableDrop(feature)) {
    return feature as FeatureClaimableDrop;
  }
  return feature;
}
