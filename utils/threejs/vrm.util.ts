import {DeepPartial} from "redux";
import {mergeDeep} from "immutable";
import {
  GltfMaterial, GltfNode, VrmHumanBone,
  VrmMaterialProperty, VrmMetadata,
  VrmStructure
} from "../../interfaces/export.interface";
import {LogError, LogWarning, Raise} from "../common.util";
import {Module} from "../../enums/common.enum";
import {VrmTextureShader} from "../../enums/export.enum";
import {
  VRM_BASE,
  VRM_HUMAN_BONES_DEFAULT,
  VRM_HUMAN_BONES_DEFAULT_LENGHT,
  VRM_HUMANOID_BONES, VRM_MAP_MIXAMO, VRM_META_DEFAULT
} from "../../constants/export.constant";

class VrmUtil {
  private static _instance: VrmUtil;
  private _vrmData: VrmStructure | undefined;

  public static Instance() {
    if(this._instance === undefined)
      this._instance = new VrmUtil();

    return this._instance;
  }

  public GetVrmData() {
    if (this._vrmData == undefined)
      this._vrmData = VRM_BASE;
    
    return structuredClone(this._vrmData);
  }
  
  public AddVrmData(extra: DeepPartial<VrmStructure>) {
    const current = this.GetVrmData();
    this._vrmData = mergeDeep(current, extra);
  }
}

export function GetVrmData() {
  return VrmUtil.Instance().GetVrmData();
}

export function GenerateVrmMaterialData(materialList: GltfMaterial[] | undefined) {
  if (materialList == undefined) {
    const msg = "Need material list in order to generate material properties!";
    return void LogError(Module.VrmUtil, msg);
  }

  const generatedMaterials = materialList
    .map((m): VrmMaterialProperty => {
      return {
        name: m.name,
        shader: VrmTextureShader.Gltf,
        keywordMap: {},
        tagMap: {},
        floatProperties: {},
        vectorProperties: {},
        textureProperties: {}
      }
    });

  const setData: VrmStructure = {
    extensions: {
      VRM: {
        materialProperties: generatedMaterials
      }
    }
  };

  VrmUtil.Instance().AddVrmData(setData);
}

export function GenerateVrmBoneData(nodes: GltfNode[] | undefined) {
  let generatedBones: VrmHumanBone[] = [];
  
  try {    
    if (nodes == undefined)
      Raise("Need skin and node list in order to generate human bones properly!");
    
    for (let i = 0; i < VRM_HUMANOID_BONES.length; i++) {
      const vrmBone = VRM_HUMANOID_BONES[i];
      const mappedName = VRM_MAP_MIXAMO[vrmBone];
      const mappedIndex = nodes.findIndex(n => n.name === mappedName);
      
      generatedBones.push({
        bone: vrmBone,
        node: mappedIndex,
        useDefaultValues: true
      });
    }
  }
  catch (e) {
    const err = e as Error;
    void LogWarning(Module.VrmUtil, err.message, e);
  }
  
  const setData: VrmStructure = {
    extensions: {
      VRM: {
        humanoid: {
          humanBones: generatedBones.length === VRM_HUMAN_BONES_DEFAULT_LENGHT
            ? generatedBones : VRM_HUMAN_BONES_DEFAULT
        }
      }
    }
  };

  VrmUtil.Instance().AddVrmData(setData);
}

export function GenerateVrmMetaData(meta: VrmMetadata | undefined) {
  let generatedMeta: VrmMetadata | undefined;
  
  try {
    if (meta == undefined)
      Raise("Need metadata in order to fill the property!");
    
    generatedMeta = meta;
  } catch (e) {
    const err = e as Error;
    void LogWarning(Module.VrmUtil, err.message, e);
  }

  const setData: VrmStructure = {
    extensions: {
      VRM: {
        meta: generatedMeta ?? VRM_META_DEFAULT
      }
    }
  };

  VrmUtil.Instance().AddVrmData(setData);
}