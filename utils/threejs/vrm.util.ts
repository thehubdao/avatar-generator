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
  VRM_HUMAN_BONES_DEFAULT_LENGTH,
  VRM_HUMANOID_BONES,
  VRM_MAP_MIXAMO,
  VRM_META_DEFAULT
} from "../../constants/export.constant";
import {
  Bone,
  BufferGeometry,
  Material,
  Matrix4,
  Object3D,
  Scene,
  Skeleton,
  SkinnedMesh,
} from "three";
import {IsBone, IsSkinnedMesh} from "../model.util";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils";

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
  const generatedBones: VrmHumanBone[] = [];
  
  try {    
    if (nodes == undefined)
      Raise("Need node list in order to generate human bones properly!");
    
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
          humanBones: generatedBones.length === VRM_HUMAN_BONES_DEFAULT_LENGTH
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

export function GenerateVrmScene(model: Object3D) {
  let scaleFactor = 1;
  
  // Create new scene, this one has the new structure
  const sceneReal = new Scene();
  sceneReal.name = "Scene";
  sceneReal.userData.name = "Scene";

  const skinnedMeshArray: SkinnedMesh[] = [];
  const geometryArray: BufferGeometry[] = [];
  const materialArray: Material[] = [];

  // Find scale, skinnedMeshArray, geometryArray and materialArray
  model.traverse(obj => {
    if (obj.name === "Armature")
      scaleFactor = obj.scale.x;
    
    if (IsSkinnedMesh(obj)) {
      skinnedMeshArray.push(obj);
      geometryArray.push(obj.geometry.clone());
      const mat = obj.material;
      if (mat instanceof Material) {
        materialArray.push(mat.clone());
      } else {
        const lel = mat.map(m => m.clone());
        materialArray.push(...lel);
      }
    }
  });

  // Remove not allowed attributes on skinnedMesh geometries
  const allowedProps = GetAllowedProps(geometryArray);
  for (const geom of geometryArray) {
    for (const key of Object.keys(geom.attributes)) {
      if (!allowedProps.includes(key))
        delete geom.attributes[key];
    }
  }

  const firstSM = skinnedMeshArray[0];
  const matrixCopy = firstSM.skeleton.boneInverses.map(b => b.clone());
  const actualBones = firstSM.skeleton.bones[0].clone(true);
  const boneArray: Bone[] = [];

  actualBones.traverse(obj => {
    if (IsBone(obj)) {
      boneArray.push(obj);
    }
  });
  
  const avatarGeom = mergeGeometries(geometryArray, true);

  const leSkinnedMesh = new SkinnedMesh(avatarGeom, materialArray);
  leSkinnedMesh.name = "Avatar";
  leSkinnedMesh.userData.name = "Avatar";

  const newSkeleton = new Skeleton(boneArray, matrixCopy);
  const identity = new Matrix4();
  leSkinnedMesh.bind(newSkeleton, identity);
  
  // Create a matrix
  const matrix = new Matrix4();
  // Rotate the matrix
  matrix.makeRotationX(Math.PI / 2);
  // rotate the object using the matrix
  actualBones.position.applyMatrix4(matrix);
  
  // Create scale matrix
  const matrixScale = new Matrix4();
  matrixScale.makeScale(scaleFactor, scaleFactor, scaleFactor);
  
  // Scale bones with scale matrix
  actualBones.scale.applyMatrix4(matrixScale);
  actualBones.position.applyMatrix4(matrixScale);
  // leSkinnedMesh.scale.applyMatrix4(matrixScale);
  
  // Rotate bones on own axis
  actualBones.rotateX(Math.PI / 2);
  actualBones.rotateY(Math.PI);

  sceneReal.children.push(actualBones);
  sceneReal.children.push(leSkinnedMesh);
  
  return sceneReal;
}

function GetAllowedProps(array: BufferGeometry[]) {
  if (array.length <= 0) return [];
  
  const allowedProps = Object.keys(array[0].attributes);
  for (let i = 1; i < array.length; i++) {
    const current = Object.keys(array[i].attributes);
    allowedProps.forEach((attribute, index) => {
      if (!current.some(a => a === attribute))
        allowedProps.splice(index, 1);
    });
  }
  
  return allowedProps;
}