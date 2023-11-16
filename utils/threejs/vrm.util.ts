import {DeepPartial} from "redux";
import {mergeDeep} from "immutable";
import {
  GltfMaterial,
  VrmMaterialProperty,
  VrmStructure
} from "../../interfaces/export.interface";
import {LogError} from "../common.util";
import {Module} from "../../enums/common.enum";
import {VrmTextureShader} from "../../enums/export.enum";
import {VRM_BASE} from "../../constants/export.constant";

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
    return void LogError(Module.ExporterUtil, msg);
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

  const setData: DeepPartial<VrmStructure> = {
    extensions: {
      VRM: {
        materialProperties: generatedMaterials
      }
    }
  };

  VrmUtil.Instance().AddVrmData(setData);
}
