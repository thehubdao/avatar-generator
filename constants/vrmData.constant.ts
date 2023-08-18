type HumanBone = {
    node: number;
};

type HumanBones = {
    [key: string]: HumanBone;
};

type VRMData = {
    extensions: {
        VRMC_vrm: {
            humanoid: {
                humanBones: HumanBones;
            },
            meta: {},
            specVersion: string
        };
    };
};
export let VRMData: VRMData = {
    "extensions": {
        "VRMC_vrm": {
            "humanoid": {
                "humanBones": {
                    "chest": { "node": 5 },
                    "head": { "node": 45 },
                    "hips": { "node": 3 },
                    "leftFoot": { "node": 132 },
                    "leftHand": { "node": 86 },
                    "leftIndexDistal": { "node": 90 },
                    "leftIndexIntermediate": { "node": 89 },
                    "leftIndexProximal": { "node": 88 },
                    "leftLittleDistal": { "node": 105 },
                    "leftLittleIntermediate": { "node": 104 },
                    "leftLittleProximal": { "node": 103 },
                    "leftLowerArm": { "node": 84 },
                    "leftLowerLeg": { "node": 131 },
                    "leftMiddleDistal": { "node": 97 },
                    "leftMiddleIntermediate": { "node": 96 },
                    "leftMiddleProximal": { "node": 95 },
                    "leftRingDistal": { "node": 101 },
                    "leftRingIntermediate": { "node": 100 },
                    "leftRingProximal": { "node": 99 },
                    "leftShoulder": { "node": 82 },
                    "leftThumbDistal": { "node": 93 },
                    "leftThumbMetacarpal": { "node": 91 },
                    "leftThumbProximal": { "node": 92 },
                    "leftToes": { "node": 134 },
                    "leftUpperArm": { "node": 83 },
                    "leftUpperLeg": { "node": 130 },
                    "neck": { "node": 44 },
                    "rightFoot": { "node": 139 },
                    "rightHand": { "node": 110 },
                    "rightIndexDistal": { "node": 114 },
                    "rightIndexIntermediate": { "node": 113 },
                    "rightIndexProximal": { "node": 112 },
                    "rightLittleDistal": { "node": 129 },
                    "rightLittleIntermediate": { "node": 128 },
                    "rightLittleProximal": { "node": 127 },
                    "rightLowerArm": { "node": 108 },
                    "rightLowerLeg": { "node": 138 },
                    "rightMiddleDistal": { "node": 121 },
                    "rightMiddleIntermediate": { "node": 120 },
                    "rightMiddleProximal": { "node": 119 },
                    "rightRingDistal": { "node": 125 },
                    "rightRingIntermediate": { "node": 124 },
                    "rightRingProximal": { "node": 123 },
                    "rightShoulder": { "node": 106 },
                    "rightThumbDistal": { "node": 117 },
                    "rightThumbMetacarpal": { "node": 115 },
                    "rightThumbProximal": { "node": 116 },
                    "rightToes": { "node": 141 },
                    "rightUpperArm": { "node": 107 },
                    "rightUpperLeg": { "node": 137 },
                    "spine": { "node": 4 }
                }
            },
            "meta": {
                "allowAntisocialOrHateUsage": true,
                "allowExcessivelySexualUsage": true,
                "allowExcessivelyViolentUsage": true,
                "allowPoliticalOrReligiousUsage": true,
                "allowRedistribution": true,
                "authors": ["The Hub"],
                "avatarPermission": "everyone",
                "commercialUsage": "corporation",
                "copyrightInformation": "The Hub",
                "creditNotation": "required",
                "licenseUrl": "https://vrm.dev/licenses/1.0/",
                "modification": "allowModificationRedistribution",
                "name": "The Hub VRM",
                "thumbnailImage": 14,
                "version": "1"
            },
            "specVersion": "1.0"
        }
    }
}