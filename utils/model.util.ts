import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ImporterUtil} from "./importer.util";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {Group, Mesh, Object3D, SkinnedMesh} from "three";
import {AccessoryInfoInterface, BasicData, PartInfoInterface} from "../interfaces/common.interface";

export async function ReplaceModelPart(baseModel: GLTF, partUrl: string, partIndex: number) {
  const partModel = await ImporterUtil.LoadGltfModel(partUrl);
  
  // @ts-ignore
  const chest = SkeletonUtils.clone(partModel.scene.children[0].children[partIndex]) as SkinnedMesh;
  // @ts-ignore
  const oldSkeleton = SkeletonUtils.getBones((baseModel.scene.children[0].children[partIndex] as SkinnedMesh).skeleton);

  chest.skeleton.bones = oldSkeleton;

  baseModel.scene.children[0].children[partIndex] = chest;
}

export async function ReplaceModelPartOnly(baseModel: Object3D, replaceModel: GLTF, partInfo: PartInfoInterface, selectedPart?: BasicData) {
  if(selectedPart == undefined) {
    console.error('No selected Part', 'There is no selected part to replace on base model.');
    return;
  }
  
  let chestMesh: Object3D | undefined = undefined;
  replaceModel.scene.traverse(m => {
    if(m.name === selectedPart.value) {
      chestMesh = m;
    }
  });
  
  if(chestMesh == undefined) {
    console.error('Piece not found:', `${selectedPart.value} not found on replace model, please verify the glb file.`);
    return;
  }
  
  // @ts-ignore
  const chest: Object3D = SkeletonUtils.clone(chestMesh);

  const baseSkeleton = (baseModel.children[partInfo.partIndex] as SkinnedMesh).skeleton;
  if((chest as Group).isGroup) {
    chest.traverse(object => {
      if((object as SkinnedMesh).isSkinnedMesh) {
        (object as SkinnedMesh).skeleton = baseSkeleton.clone();
      }
    });
  }
  
  if((chest as SkinnedMesh).isSkinnedMesh) {
    (chest as SkinnedMesh).skeleton = baseSkeleton.clone();
  }
  
  console.log('base', baseModel);
  console.log('replace', chest);
  console.log('partInfo', partInfo);
  
  baseModel.children.splice(partInfo.partIndex, 1);
  baseModel.add(chest);
}


export function ReplaceModelAccessory(bone: AccessoryInfoInterface, accessory: GLTF) {
  const accessoryMesh = accessory.scene.children[0].clone() as Mesh;
  accessoryMesh.scale.set(0.8, 0.8, 0.8);
  
  if(bone.hasIt) {
    bone.bone.children.splice(bone.accessoryIndex!, 1);
    // bone.bone.children[bone.accessoryIndex!] = accessoryMesh;
  }
  
  bone.accessoryIndex = bone.bone.children.length;
  bone.hasIt = true;
  bone.bone.add(accessoryMesh);
  
  console.log(bone);
}