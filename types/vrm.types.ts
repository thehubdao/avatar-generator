type HumanBone = {
    bone: string,
    node: number,
    useDefaultValues: boolean;
};

type MaterialProperties = {
    name: string,
    shader: string,
    keywordMap: object,
    tagMap: object,
    floatProperties: object,
    vectorProperties: object,
    textureProperties: object
};

export type VRMData = {
    VRM: {
        materialProperties: MaterialProperties[],
        exporterVersion: string,
        specVersion: string,
        meta: object,
        humanoid: {
            humanBones: HumanBone[],
            armStretch: number,
            legStretch: number,
            upperArmTwist: number,
            lowerArmTwist: number,
            upperLegTwist: number,
            lowerLegTwist: number,
            feetSpacing: number,
            hasTranslationDoF: boolean
        },
    };
};

export type VRMObject = {
    accessors: Array<object>,
    asset: object,
    bufferView: Array<object>,
    buffers: ArrayBuffer,
    extensions: VRMData,
    extensionsUsed: Array<string>,
    images: Array<object>,
    materials: Array<object>,
    meshes: Array<object>,
    nodes: Array<object>,
    samplers: Array<object>,
    scene: number,
    scenes: Array<object>,
    skins: Array<object>,
    textures: Array<object>
}