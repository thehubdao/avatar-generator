import {VrmHumanBone, VrmMetadata, VrmStructure} from "../interfaces/export.interface";
import {MixamoBone, VrmHumanoidBones} from "../types/export.type";

export const VRM_SPEC_VERSION = [ "0.0" ] as const;

export const VRM_META_AUTHOR = [
  "OnlyAuthor",
  "ExplicitlyLicensedPerson",
  "Everyone"
] as const;

export const VRM_META_ALLOW = [
  "Disallow",
  "Allow"
] as const;

export const VRM_META_LICENSE = [
  "Redistribution_Prohibited",
  "CC0",
  "CC_BY",
  "CC_BY_NC",
  "CC_BY_SA",
  "CC_BY_NC_SA",
  "CC_BY_ND",
  "CC_BY_NC_ND",
  "Other"
] as const;

export const VRM_HUMANOID_BONES = [
  "hips",
  "spine",
  "chest",
  "neck",
  "head",
  "leftUpperLeg",
  "leftLowerLeg",
  "leftFoot",
  "rightUpperLeg",
  "rightLowerLeg",
  "rightFoot",
  "leftUpperArm",
  "leftLowerArm",
  "leftHand",
  "rightUpperArm",
  "rightLowerArm",
  "rightHand"
] as const;

// ^ obligatory list of bones for vrm0
// Whole list of bones for vrm0
// "rightUpperLeg","leftLowerLeg","rightLowerLeg","leftFoot","rightFoot","spine","chest","neck","head","leftShoulder","rightShoulder","leftUpperArm","rightUpperArm","leftLowerArm","rightLowerArm","leftHand","rightHand","leftToes","rightToes","leftEye","rightEye","jaw","leftThumbProximal","leftThumbIntermediate","leftThumbDistal","leftIndexProximal","leftIndexIntermediate","leftIndexDistal","leftMiddleProximal","leftMiddleIntermediate","leftMiddleDistal","leftRingProximal","leftRingIntermediate","leftRingDistal","leftLittleProximal","leftLittleIntermediate","leftLittleDistal","rightThumbProximal","rightThumbIntermediate","rightThumbDistal","rightIndexProximal","rightIndexIntermediate","rightIndexDistal","rightMiddleProximal","rightMiddleIntermediate","rightMiddleDistal","rightRingProximal","rightRingIntermediate","rightRingDistal","rightLittleProximal","rightLittleIntermediate","rightLittleDistal","upperChest"

export const VRM_FIRST_PERSON_LOOK_AT = [
  "Bone",
  "BlendShape"
] as const;

export const VRM_BLEND_SHAPE_PRESET = [
  "unknown",
  "neutral",
  "a",
  "i",
  "u",
  "e",
  "o",
  "blink",
  "joy",
  "angry",
  "sorrow",
  "fun",
  "lookup",
  "lookdown",
  "lookleft",
  "lookright",
  "blink_l",
  "blink_r"
] as const;

export const MIXAMO_BONE = [
  "mixamorigSpine2",
  "mixamorigHead",
  "mixamorigHips",
  "mixamorigLeftFoot",
  "mixamorigLeftHand",
  "mixamorigLeftForeArm",
  "mixamorigLeftLeg",
  "mixamorigLeftArm",
  "mixamorigLeftUpLeg",
  "mixamorigNeck",
  "mixamorigRightFoot",
  "mixamorigRightHand",
  "mixamorigRightForeArm",
  "mixamorigRightLeg",
  "mixamorigRightArm",
  "mixamorigRightUpLeg",
  "mixamorigSpine1"
] as const;

export const VRM_META_DEFAULT: VrmMetadata = {
  title: "The Citizens",
  version: "0.1",
  author: "The Hub Studios",
  contactInformation: "",
  reference: "",
  allowedUserName: "OnlyAuthor",
  violentUssageName: "Disallow",
  sexualUssageName: "Disallow",
  commercialUssageName: "Disallow",
  otherPermissionUrl: "",
  licenseName: "Redistribution_Prohibited",
  otherLicenseUrl: "",
} as const;

export const VRM_HUMAN_BONES_DEFAULT: VrmHumanBone[] = [
  {
    bone: "hips",
    node: 64,
    useDefaultValues: true
  },
  {
    bone: "spine",
    node: 53,
    useDefaultValues: true
  },
  {
    bone: "chest",
    node: 51,
    useDefaultValues: true
  },
  {
    bone: "neck",
    node: 2,
    useDefaultValues: true
  },
  {
    bone: "head",
    node: 1,
    useDefaultValues: true
  },
  {
    bone: "leftUpperLeg",
    node: 58,
    useDefaultValues: true
  },
  {
    bone: "leftLowerLeg",
    node: 57,
    useDefaultValues: true
  },
  {
    bone: "leftFoot",
    node: 56,
    useDefaultValues: true
  },
  {
    bone: "rightUpperLeg",
    node: 63,
    useDefaultValues: true
  },
  {
    bone: "rightLowerLeg",
    node: 62,
    useDefaultValues: true
  },
  {
    bone: "rightFoot",
    node: 61,
    useDefaultValues: true
  },
  {
    bone: "leftUpperArm",
    node: 25,
    useDefaultValues: true
  },
  {
    bone: "leftLowerArm",
    node: 24,
    useDefaultValues: true
  },
  {
    bone: "leftHand",
    node: 23,
    useDefaultValues: true
  },
  {
    bone: "rightUpperArm",
    node: 49,
    useDefaultValues: true
  },
  {
    bone: "rightLowerArm",
    node: 48,
    useDefaultValues: true
  },
  {
    bone: "rightHand",
    node: 47,
    useDefaultValues: true
  }
];

export const VRM_HUMAN_BONES_DEFAULT_LENGTH = VRM_HUMAN_BONES_DEFAULT.length;

export const VRM_BASE: VrmStructure = {
  extensions: {
    VRM: {
      exporterVersion: "avatarhub_vrm_exporter_experimental_0.3",
      specVersion: "0.0",
      humanoid: {
        armStretch: 0.05000000074505806,
        legStretch: 0.05000000074505806,
        upperArmTwist: 0.5,
        lowerArmTwist: 0.5,
        upperLegTwist: 0.5,
        lowerLegTwist: 0.5,
        feetSpacing: 0,
        hasTranslationDoF: false
      },
      firstPerson: {
        firstPersonBone: 5,
        firstPersonBoneOffset: {
          x: 0,
          y: 0,
          z: 0
        },
        meshAnnotations: [],
        lookAtTypeName: "Bone",
        lookAtHorizontalInner: {
          curve: [
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            0
          ],
          xRange: 90,
          yRange: 10
        },
        lookAtHorizontalOuter: {
          curve: [
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            0
          ],
          xRange: 90,
          yRange: 10
        },
        lookAtVerticalDown: {
          curve: [
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            0
          ],
          xRange: 90,
          yRange: 10
        },
        lookAtVerticalUp: {
          curve: [
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            0
          ],
          xRange: 90,
          yRange: 10
        }
      },
      blendShapeMaster: {
        blendShapeGroups: [
          {
            name: "Neutral",
            presetName: "neutral",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "A",
            presetName: "a",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "I",
            presetName: "i",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "U",
            presetName: "u",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "E",
            presetName: "e",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "O",
            presetName: "o",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "Blink",
            presetName: "blink",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "Joy",
            presetName: "joy",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "Angry",
            presetName: "angry",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "Sorrow",
            presetName: "sorrow",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "Fun",
            presetName: "fun",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "Blink_L",
            presetName: "blink_l",
            binds: [],
            materialValues: [],
            isBinary: false
          },
          {
            name: "Blink_R",
            presetName: "blink_r",
            binds: [],
            materialValues: [],
            isBinary: false
          }
        ]
      },
      secondaryAnimation: {
        colliderGroups: [],
        boneGroups: []
      }
    }
  }
};

export const VRM_MAP_MIXAMO: Record<VrmHumanoidBones, MixamoBone> = {
  "chest": "mixamorigSpine2",
  "head": "mixamorigHead",
  "hips": "mixamorigHips",
  "leftFoot": "mixamorigLeftFoot",
  "leftHand": "mixamorigLeftHand",
  "leftLowerArm": "mixamorigLeftForeArm",
  "leftLowerLeg": "mixamorigLeftLeg",
  "leftUpperArm": "mixamorigLeftArm",
  "leftUpperLeg": "mixamorigLeftUpLeg",
  "neck": "mixamorigNeck",
  "rightFoot": "mixamorigRightFoot",
  "rightHand": "mixamorigRightHand",
  "rightLowerArm": "mixamorigRightForeArm",
  "rightLowerLeg": "mixamorigRightLeg",
  "rightUpperArm": "mixamorigRightArm",
  "rightUpperLeg": "mixamorigRightUpLeg",
  "spine": "mixamorigSpine1",
} as const;