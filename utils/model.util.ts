import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ImporterUtil} from "./importer.util";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {Mesh, Object3D, SkinnedMesh} from "three";
import {AccessoryPartTypeEnum, BodyPartTypeEnum} from "../enums/common.enum";
import {AccessoryInfoInterface} from "../interfaces/accessory-parts.interface";

export async function ReplaceModelPart(baseModel: GLTF, partUrl: string, partIndex: number) {
  const partModel = await ImporterUtil.LoadGltfModel(partUrl);
  
  // @ts-ignore
  const chest = SkeletonUtils.clone(partModel.scene.children[0].children[partIndex]) as SkinnedMesh;
  // @ts-ignore
  const oldSkeleton = SkeletonUtils.getBones((baseModel.scene.children[0].children[partIndex] as SkinnedMesh).skeleton);

  chest.skeleton.bones = oldSkeleton;

  baseModel.scene.children[0].children[partIndex] = chest;
}

export async function ReplaceModelPartOnly(baseModel: GLTF, replaceModel: GLTF, partIndex: BodyPartTypeEnum) {
  // @ts-ignore
  const chest = SkeletonUtils.clone(replaceModel.scene.children[0].children[1]) as Mesh;
  const oldModel = baseModel.scene.children[0].children[partIndex] as SkinnedMesh;
  
  console.log('base', baseModel);
  console.log('replace', replaceModel);
  
  oldModel.geometry = chest.geometry;
  oldModel.updateMatrix();
}


export function ReplaceModelAccessory(bone: AccessoryInfoInterface, accessory: GLTF) {
  const accessoryMesh = accessory.scene.children[0].clone() as Mesh;
  accessoryMesh.scale.set(0.1, 0.1, 0.1);
  
  if(bone.hasIt) {
    bone.bone.children.splice(bone.accessoryIndex!, 1);
  }
  
  bone.accessoryIndex = bone.bone.children.length;
  bone.hasIt = true;
  bone.bone.add(accessoryMesh);
  console.log(bone);
}