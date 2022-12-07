import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {Group, Material, Mesh, MeshStandardMaterial, MeshToonMaterial, Object3D, Skeleton, SkinnedMesh} from "three";
import {AccessoryInfoInterface, BasicData, FeatureInfoInterface} from "../interfaces/common.interface";
import {TextureTone, TextureUtil} from "./texture.util";
import {LogError} from "./common.util";
import {Module} from "../enums/common.enum";
import {LoadGltfModel} from "./importer.util";

type MaterialFunction = (obj: SkinnedMesh, tone?: TextureTone) => void;

export async function ReplaceModelPart(baseModel: GLTF, partUrl: string, partIndex: number) {
  const partModel = await LoadGltfModel(partUrl);
  
  const chest = SkeletonUtils.clone(partModel.scene.children[0].children[partIndex]) as SkinnedMesh;
  const oldSkeleton = SkeletonUtils.getBones((baseModel.scene.children[0].children[partIndex] as SkinnedMesh).skeleton);

  chest.skeleton.bones = oldSkeleton;

  baseModel.scene.children[0].children[partIndex] = chest;
}

export async function ReplaceModelPartOnly(baseModel: Object3D, replaceModel: GLTF, partInfo: FeatureInfoInterface, selectedPart?: BasicData, skinColor?: string) {
  if(selectedPart == undefined)
    return LogError(Module.ModelUtil, "There is no selected part to replace on base model.");
  
  let chestMesh: Object3D | undefined = await GetMatchPiece(replaceModel, selectedPart.val);
  if(chestMesh == undefined)
    return LogError(Module.ModelUtil, `Piece not found: '${selectedPart.val}' not found on replace model, please verify the glb file.`);
  
  const newPart: Object3D = SkeletonUtils.clone(chestMesh);
  let baseSkeleton: Skeleton;
  const basePartRef = baseModel.children[partInfo.partIndex];
  if((basePartRef as SkinnedMesh).isSkinnedMesh) {
    baseSkeleton = (basePartRef as SkinnedMesh).skeleton;
  }
  else if((basePartRef as Group).isGroup) {
    baseSkeleton = (basePartRef.children[0] as SkinnedMesh).skeleton;
  }
  else {
    return LogError(Module.ModelUtil, "Skeleton missing from base_mesh some of the parts have weird components.")
  }
  
  await ChangeSkeleton(newPart, baseSkeleton, ChangeToToonMaterial, "threeTone");
  
  if(skinColor) {
    await ChangeObjectSkinColor(newPart, skinColor);
  }
  
  // console.log('base', baseModel);
  // console.log('replace', newPart);
  // console.log('partInfo', partInfo);
  
  newPart.frustumCulled = false;
  baseModel.children.splice(partInfo.partIndex, 1);
  baseModel.add(newPart);
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

async function ChangeSkeleton(newPart: Object3D, baseSkeleton: Skeleton, changeMaterial?: MaterialFunction, tone?: TextureTone) {
  if((newPart as Group).isGroup) {
    newPart.traverse( async object => {
      if((object as SkinnedMesh).isSkinnedMesh) {
        (object as SkinnedMesh).skeleton = baseSkeleton.clone();
        if(changeMaterial && tone)
          await changeMaterial(object as SkinnedMesh, tone);
      }
      
      object.frustumCulled = false;
    });
  }

  if((newPart as SkinnedMesh).isSkinnedMesh) {
    (newPart as SkinnedMesh).skeleton = baseSkeleton.clone();
    if(changeMaterial && tone)
      await changeMaterial(newPart as SkinnedMesh, tone);
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