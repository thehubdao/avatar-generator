import {VrmTextureShader} from "../enums/export.enum";
import {
  VrmBlendShapePreset,
  VrmFirstPersonLookAtType,
  VrmHumanoidBones,
  VrmMetaAllow,
  VrmMetaAuthor,
  VrmMetaLicense,
  VrmSpecVersion
} from "../types/export.type";

interface DegreeMap {
  curve: number[];
  xRange: number;
  yRange: number;
}

export interface GltfMaterial {
  name: string;
}

export interface GltfSkin {
  inverseBindMatrices: number;
  joints: number[];
  skeleton: number;
}

export interface GltfNode {
  mesh?: number;
  children?: number[];
}

export interface GltfScene {
  nodes: number[];
}

// TODO: fix type?
export interface VrmMaterialProperty {
  name: string;
  shader: VrmTextureShader;
  keywordMap: {};
  tagMap: {};
  floatProperties: {};
  vectorProperties: {};
  textureProperties: {};
}

export interface VrmMetadata {
  title: string;
  version: string;
  author: string;
  contactInformation: string;
  reference: string;
  allowedUserName: VrmMetaAuthor;
  violentUssageName: VrmMetaAllow;
  sexualUssageName: VrmMetaAllow;
  commercialUssageName: VrmMetaAllow;
  otherPermissionUrl: string;
  licenseName: VrmMetaLicense;
  otherLicenseUrl?: string;
}

export interface VrmStructure {
  // TODO: probably wont go
  scenes?: GltfScene[];
  nodes?: GltfNode[];
  skins?: GltfSkin[];
  materials?: GltfMaterial[];
  buffers?: {
    byteLength: number;
    uri?: string;
  }[];
  
  extensionsUsed?: string[];
  extensions: {
    VRM: {
      materialProperties?: VrmMaterialProperty[];
      exporterVersion: "avatarhub_vrm_exporter_experimental_0.3";
      specVersion: VrmSpecVersion;
      meta?: VrmMetadata;
      humanoid: {
        humanBones: {
          bone: VrmHumanoidBones,
          node: number;
          useDefaultValues: boolean;
        }[];
        armStretch: number;
        legStretch: number;
        upperArmTwist: number;
        lowerArmTwist: number;
        upperLegTwist: number;
        lowerLegTwist: number;
        feetSpacing: number;
        hasTranslationDoF: boolean;
      };
      firstPerson: {
        firstPersonBone: number;
        firstPersonBoneOffset: {
          x: number;
          y: number;
          z: number;
        };
        meshAnnotations: {
          mesh: number;
          firstPersonFlag: string;
        }[];
        lookAtTypeName: VrmFirstPersonLookAtType;
        lookAtHorizontalInner: DegreeMap;
        lookAtHorizontalOuter: DegreeMap;
        lookAtVerticalDown: DegreeMap;
        lookAtVerticalUp: DegreeMap;
      };
      blendShapeMaster: {
        blendShapeGroups: {
          name: string;
          presetName: VrmBlendShapePreset;
          binds: {
            mesh: number;
            index: number;
            weight: number;
          }[];
          materialValues: {
            materialName: string;
            propertyName: string;
            targetValue: number[];
          }[];
          isBinary: boolean;
        }[];
      };
      secondaryAnimation: {
        colliderGroups: {
          node: number;
          colliders: {
            offset: {
              x: number;
              y: number;
              z: number;
            };
            radius: number;
          }[];
        }[];
        boneGroups: {
          comment: string;
          stiffiness: number;
          gravityPower: number;
          gravityDir: {
            x: number;
            y: number;
            z: number;
          };
          dragForce: number;
          center: number;
          hitRadius: number;
          bones: number[];
          colliderGroups: number[];
        }[];
      }
    }
  }
}
