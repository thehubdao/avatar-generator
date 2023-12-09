import {
  MIXAMO_BONE,
  VRM_BLEND_SHAPE_PRESET,
  VRM_FIRST_PERSON_LOOK_AT,
  VRM_HUMANOID_BONES,
  VRM_META_ALLOW,
  VRM_META_AUTHOR,
  VRM_META_LICENSE,
  VRM_SPEC_VERSION
} from "../constants/export.constant";

export type VrmSpecVersion = typeof VRM_SPEC_VERSION[number];

export type VrmMetaAuthor = typeof VRM_META_AUTHOR[number];

export type VrmMetaAllow = typeof VRM_META_ALLOW[number];

export type VrmMetaLicense = typeof VRM_META_LICENSE[number];

export type VrmHumanoidBones = typeof VRM_HUMANOID_BONES[number];

export type VrmFirstPersonLookAtType = typeof VRM_FIRST_PERSON_LOOK_AT[number];

export type VrmBlendShapePreset = typeof VRM_BLEND_SHAPE_PRESET[number];

export type MixamoBone = typeof MIXAMO_BONE[number];