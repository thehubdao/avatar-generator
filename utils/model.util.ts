import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {Group, Material, Mesh, MeshStandardMaterial, MeshToonMaterial, Object3D, Skeleton, SkinnedMesh} from "three";
import {AccessoryInfoInterface, BasicData, FeatureInfoInterface} from "../interfaces/common.interface";
import {TextureTone, TextureUtil} from "./texture.util";
import {LogError} from "./common.util";
import {Module} from "../enums/common.enum";
import {LoadGltfModel} from "./importer.util";

type MaterialFunction = (obj: SkinnedMesh, tone?: TextureTone) => void;

export async function ReplaceModelFeature(baseModel: GLTF, featureUrl: string, featureIndex: number) {
  const featureModel = await LoadGltfModel(featureUrl);
  
  const chest = SkeletonUtils.clone(featureModel.scene.children[0].children[featureIndex]) as SkinnedMesh;
  const oldSkeleton = SkeletonUtils.getBones((baseModel.scene.children[0].children[featureIndex] as SkinnedMesh).skeleton);

  chest.skeleton.bones = oldSkeleton;

  baseModel.scene.children[0].children[featureIndex] = chest;
}

export async function ReplaceModelFeatureOnly(baseModel: Object3D, replaceModel: GLTF, featureInfo: FeatureInfoInterface, selectedFeature?: BasicData, skinColor?: string) {
  if(selectedFeature == undefined)
    return LogError(Module.ModelUtil, "There is no selected feature to replace on base model.");
  
  let changeMesh: Object3D | undefined = await GetMatchPiece(replaceModel, selectedFeature.val);
  if(changeMesh == undefined)
    return LogError(Module.ModelUtil, `Piece not found: '${selectedFeature.val}' not found on replace model, please verify the glb file.`);
  
  const newFeature: Object3D = SkeletonUtils.clone(changeMesh);
  let baseSkeleton: Skeleton;
  const baseFeatureRef = baseModel.children[featureInfo.featureIndex];
  if((baseFeatureRef as SkinnedMesh).isSkinnedMesh) {
    baseSkeleton = (baseFeatureRef as SkinnedMesh).skeleton;
  }
  else if((baseFeatureRef as Group).isGroup) {
    baseSkeleton = (baseFeatureRef.children[0] as SkinnedMesh).skeleton;
  }
  else {
    return LogError(Module.ModelUtil, "Skeleton missing from base_mesh some of the features have weird components.")
  }
  
  await ChangeSkeleton(newFeature, baseSkeleton, ChangeToToonMaterial, "threeTone");
  
  if(skinColor) {
    await ChangeObjectSkinColor(newFeature, skinColor);
  }
  
  newFeature.frustumCulled = false;
  baseModel.children.splice(featureInfo.featureIndex, 1);
  baseModel.add(newFeature);
}

async function GetMatchPiece(object: GLTF, match: string) {
  let retObj: Object3D | undefined;
  object.scene.traverse(m => {
    if(m.name === match) {
      retObj = m;
    }
  });
  
  return retObj;
}

async function ChangeSkeleton(newFeature: Object3D, baseSkeleton: Skeleton, changeMaterial?: MaterialFunction, tone?: TextureTone) {
  if((newFeature as Group).isGroup) {
    newFeature.traverse( async object => {
      if((object as SkinnedMesh).isSkinnedMesh) {
        (object as SkinnedMesh).skeleton = baseSkeleton.clone();
        if(changeMaterial && tone)
          await changeMaterial(object as SkinnedMesh, tone);
      }
      
      object.frustumCulled = false;
    });
  }

  if((newFeature as SkinnedMesh).isSkinnedMesh) {
    (newFeature as SkinnedMesh).skeleton = baseSkeleton.clone();
    if(changeMaterial && tone)
      await changeMaterial(newFeature as SkinnedMesh, tone);
  }
}

export function ReplaceModelAccessory(accessoriesInfo: Record<string, AccessoryInfoInterface>, selectedAcc: string, accessory: GLTF) {
  const bone = accessoriesInfo[selectedAcc];
  const accessoryMesh = accessory.scene.children[0].clone() as Mesh;
  accessoryMesh.scale.set(1, 1, 1);

  if(bone.hasIt) {
    bone.bone.children.splice(bone.accessoryIndex!, 1);
    if(bone.accessoryIndex! < bone.bone.children.length) {
      for (const key in accessoriesInfo) {
        if (key !== selectedAcc && accessoriesInfo[key].bone.name === bone.bone.name && accessoriesInfo[key].accessoryIndex != undefined) {
          accessoriesInfo[key].accessoryIndex! -= 1;
        }
      }
    }
  }
  
  bone.accessoryIndex = bone.bone.children.length;
  bone.hasIt = true;
  bone.bone.add(accessoryMesh);
}

export async function ChangeToToonMaterial(object: SkinnedMesh, tone?: TextureTone) {
  const materialRef = object.material as MeshStandardMaterial;
  if(materialRef.isMeshStandardMaterial) {
    const mapClone = materialRef.map?.clone();
    const oldName = materialRef.name;
    const _toneTexture = await TextureUtil.Instance().GetToneTexture(tone);
    object.material = new MeshToonMaterial({
      map: mapClone,
      name: oldName,
      gradientMap: _toneTexture,
      transparent: true,
    });
  }
}

export async function TransformObject3dToToonMaterial(object: Object3D, tone?: TextureTone) {
  object.traverse(async subObj => {
    const skinnedRef = subObj as SkinnedMesh;
    if(skinnedRef.isSkinnedMesh) {
      await ChangeToToonMaterial(skinnedRef, tone);
    }
  });
}

export async function ChangeObjectSkinColor(object: Object3D, skinColor: string, skinMatName: string = 'AvatarSkin_MAT') {
  object.traverse(subObject => {
    const objectRef = subObject as SkinnedMesh;
    if(objectRef.isSkinnedMesh) {
      const matRef = objectRef.material as Material;
      if(matRef.name === skinMatName)
        (matRef as MeshStandardMaterial).color.set(`#${skinColor}`);
    }
  });
}