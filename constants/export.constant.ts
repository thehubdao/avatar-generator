import {VrmHumanBone, VrmMetadata, VrmStructure} from "../interfaces/export.interface";

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
  "leftShoulder",
  "rightUpperArm",
  "rightLowerArm",
  "rightHand",
  "rightShoulder",
  "leftEye",
  "rightEye",
  "leftToes",
  "rightToes",
  // fingers
  // left thumb
  "leftThumbProximal",
  "leftThumbIntermediate",
  "leftThumbDistal",
  // left index
  "leftIndexProximal",
  "leftIndexIntermediate",
  "leftIndexDistal",
  // left middle
  "leftMiddleProximal",
  "leftMiddleIntermediate",
  "leftMiddleDistal",
  // left ring
  "leftRingProximal",
  "leftRingIntermediate",
  "leftRingDistal",
  // left little
  "leftLittleProximal",
  "leftLittleIntermediate",
  "leftLittleDistal",

  //right thumb
  "rightThumbProximal",
  "rightThumbIntermediate",
  "rightThumbDistal",

  //right index
  "rightIndexProximal",
  "rightIndexIntermediate",
  "rightIndexDistal",

  //right middle
  "rightMiddleProximal",
  "rightMiddleIntermediate",
  "rightMiddleDistal",

  //right ring
  "rightRingProximal",
  "rightRingIntermediate",
  "rightRingDistal",

  //right ring
  "rightLittleProximal",
  "rightLittleIntermediate",
  "rightLittleDistal",
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
  "mixamorigSpine1",

  // **Optionals**
  // shoulders
  "shoulderR",
  "shoulderL",

  // fingers
  // left thumb
  "mixamorigLeftHandThumb1",
  "mixamorigLeftHandThumb2",
  "mixamorigLeftHandThumb3",
  // left index
  "mixamorigLeftHandIndex1",
  "mixamorigLeftHandIndex2",
  "mixamorigLeftHandIndex3",
  // left middle
  "mixamorigLeftHandMiddle1",
  "mixamorigLeftHandMiddle2",
  "mixamorigLeftHandMiddle3",
  // left ring
  "mixamorigLeftHandRing1",
  "mixamorigLeftHandRing2",
  "mixamorigLeftHandRing3",
  // left little
  "mixamorigLeftHandPinky1",
  "mixamorigLeftHandPinky2",
  "mixamorigLeftHandPinky3",

  // right thumb
  "mixamorigRightHandThumb1",
  "mixamorigRightHandThumb2",
  "mixamorigRightHandThumb3",
  // right index
  "mixamorigRightHandIndex1",
  "mixamorigRightHandIndex2",
  "mixamorigRightHandIndex3",
  // right middle
  "mixamorigRightHandMiddle1",
  "mixamorigRightHandMiddle2",
  "mixamorigRightHandMiddle3",
  // right ring
  "mixamorigRightHandRing1",
  "mixamorigRightHandRing2",
  "mixamorigRightHandRing3",
  // right little
  "mixamorigRightHandPinky1",
  "mixamorigRightHandPinky2",
  "mixamorigRightHandPinky3",


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
      "bone": "chest",
      "node": 42,
      "useDefaultValues": true
  },
  {
      "bone": "head",
      "node": 2,
      "useDefaultValues": true
  },
  {
      "bone": "hips",
      "node": 52,
      "useDefaultValues": true
  },
  {
      "bone": "neck",
      "node": 3,
      "useDefaultValues": true
  },
  {
      "bone": "spine",
      "node": 43,
      "useDefaultValues": true
  },
  {
      "bone": "leftFoot",
      "node": 45,
      "useDefaultValues": true
  },
  {
      "bone": "leftHand",
      "node": 19,
      "useDefaultValues": true
  },
  {
      "bone": "leftLowerArm",
      "node": 20,
      "useDefaultValues": true
  },
  {
      "bone": "leftLowerLeg",
      "node": 46,
      "useDefaultValues": true
  },
  {
      "bone": "leftUpperArm",
      "node": 21,
      "useDefaultValues": true
  },
  {
      "bone": "leftUpperLeg",
      "node": 47,
      "useDefaultValues": true
  },
  {
      "bone": "leftShoulder",
      "node": 22,
      "useDefaultValues": true
  },
  {
      "bone": "leftToes",
      "node": 44,
      "useDefaultValues": true
  },
  {
      "bone": "leftEye",
      "node": 0,
      "useDefaultValues": true
  },
  {
      "bone": "rightFoot",
      "node": 49,
      "useDefaultValues": true
  },
  {
      "bone": "rightHand",
      "node": 38,
      "useDefaultValues": true
  },
  {
      "bone": "rightLowerArm",
      "node": 39,
      "useDefaultValues": true
  },
  {
      "bone": "rightLowerLeg",
      "node": 50,
      "useDefaultValues": true
  },
  {
      "bone": "rightUpperArm",
      "node": 40,
      "useDefaultValues": true
  },
  {
      "bone": "rightUpperLeg",
      "node": 51,
      "useDefaultValues": true
  },
  {
      "bone": "rightShoulder",
      "node": 41,
      "useDefaultValues": true
  },
  {
      "bone": "rightToes",
      "node": 48,
      "useDefaultValues": true
  },
  {
      "bone": "rightEye",
      "node": 1,
      "useDefaultValues": true
  },
  {
      "bone": "leftThumbProximal",
      "node": 6,
      "useDefaultValues": true
  },
  {
      "bone": "leftThumbIntermediate",
      "node": 5,
      "useDefaultValues": true
  },
  {
      "bone": "leftThumbDistal",
      "node": 4,
      "useDefaultValues": true
  },
  {
      "bone": "leftIndexProximal",
      "node": 9,
      "useDefaultValues": true
  },
  {
      "bone": "leftIndexIntermediate",
      "node": 8,
      "useDefaultValues": true
  },
  {
      "bone": "leftIndexDistal",
      "node": 7,
      "useDefaultValues": true
  },
  {
      "bone": "leftMiddleProximal",
      "node": 12,
      "useDefaultValues": true
  },
  {
      "bone": "leftMiddleIntermediate",
      "node": 11,
      "useDefaultValues": true
  },
  {
      "bone": "leftMiddleDistal",
      "node": 10,
      "useDefaultValues": true
  },
  {
      "bone": "leftRingProximal",
      "node": 15,
      "useDefaultValues": true
  },
  {
      "bone": "leftRingIntermediate",
      "node": 14,
      "useDefaultValues": true
  },
  {
      "bone": "leftRingDistal",
      "node": 13,
      "useDefaultValues": true
  },
  {
      "bone": "leftLittleProximal",
      "node": 18,
      "useDefaultValues": true
  },
  {
      "bone": "leftLittleIntermediate",
      "node": 17,
      "useDefaultValues": true
  },
  {
      "bone": "leftLittleDistal",
      "node": 16,
      "useDefaultValues": true
  },
  {
      "bone": "rightThumbProximal",
      "node": 25,
      "useDefaultValues": true
  },
  {
      "bone": "rightThumbIntermediate",
      "node": 24,
      "useDefaultValues": true
  },
  {
      "bone": "rightThumbDistal",
      "node": 23,
      "useDefaultValues": true
  },
  {
      "bone": "rightIndexProximal",
      "node": 28,
      "useDefaultValues": true
  },
  {
      "bone": "rightIndexIntermediate",
      "node": 27,
      "useDefaultValues": true
  },
  {
      "bone": "rightIndexDistal",
      "node": 26,
      "useDefaultValues": true
  },
  {
      "bone": "rightMiddleProximal",
      "node": 31,
      "useDefaultValues": true
  },
  {
      "bone": "rightMiddleIntermediate",
      "node": 30,
      "useDefaultValues": true
  },
  {
      "bone": "rightMiddleDistal",
      "node": 29,
      "useDefaultValues": true
  },
  {
      "bone": "rightRingProximal",
      "node": 34,
      "useDefaultValues": true
  },
  {
      "bone": "rightRingIntermediate",
      "node": 33,
      "useDefaultValues": true
  },
  {
      "bone": "rightRingDistal",
      "node": 32,
      "useDefaultValues": true
  },
  {
      "bone": "rightLittleProximal",
      "node": 37,
      "useDefaultValues": true
  },
  {
      "bone": "rightLittleIntermediate",
      "node": 36,
      "useDefaultValues": true
  },
  {
      "bone": "rightLittleDistal",
      "node": 35,
      "useDefaultValues": true
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

export const VRM_MAP_MIXAMO: Record<string, string> = {
  "chest": "chest",
  "head": "head",
  "hips": "hips",
  "neck": "neck",
  "spine": "spine",
  "leftFoot": "footL",
  "leftHand": "handL",
  "leftLowerArm": "lower_armL",
  "leftLowerLeg": "lower_legL",
  "leftUpperArm": "upper_armL",
  "leftUpperLeg": "upper_legL",
  "leftShoulder": "shoulderL",
  "leftToes": "toesL",
  "leftEye": "eyeL",
  
  "rightFoot": "footR",
  "rightHand": "handR",
  "rightLowerArm": "lower_armR",
  "rightLowerLeg": "lower_legR",
  "rightUpperArm": "upper_armR",
  "rightUpperLeg": "upper_legR",
  "rightShoulder": "shoulderR",
  "rightToes": "toesR",
  "rightEye": "eyeR",

  // fingers
  // left thumb
  "leftThumbProximal": "thumb_proximalL",
  "leftThumbIntermediate": "thumb_intermediateL",
  "leftThumbDistal": "thumb_distalL",
  // left index
  "leftIndexProximal": "index_proximalL",
  "leftIndexIntermediate": "index_intermediateL",
  "leftIndexDistal": "index_distalL",
  // left middle
  "leftMiddleProximal": "middle_proximalL",
  "leftMiddleIntermediate": "middle_intermediateL",
  "leftMiddleDistal": "middle_distalL",
  // left ring
  "leftRingProximal": "ring_proximalL",
  "leftRingIntermediate": "ring_intermediateL",
  "leftRingDistal": "ring_distalL",
  // left little
  "leftLittleProximal": "little_proximalL",
  "leftLittleIntermediate": "little_intermediateL",
  "leftLittleDistal": "little_distalL",

  //right thumb
  "rightThumbProximal": "thumb_proximalR",
  "rightThumbIntermediate": "thumb_intermediateR",
  "rightThumbDistal": "thumb_distalR",

  //right index
  "rightIndexProximal": "index_proximalR",
  "rightIndexIntermediate": "index_intermediateR",
  "rightIndexDistal": "index_distalR",

  //right middle
  "rightMiddleProximal": "middle_proximalR",
  "rightMiddleIntermediate": "middle_intermediateR",
  "rightMiddleDistal": "middle_distalR",

  //right ring
  "rightRingProximal": "ring_proximalR",
  "rightRingIntermediate": "ring_intermediateR",
  "rightRingDistal": "ring_distalR",

  //right ring
  "rightLittleProximal": "little_proximalR",
  "rightLittleIntermediate": "little_intermediateR",
  "rightLittleDistal": "little_distalR",

} as const;