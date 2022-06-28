import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ImporterUtil} from "./importer.util";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {Mesh, Object3D, SkinnedMesh} from "three";
import {AccessoryPartTypeEnum, BodyPartTypeEnum} from "../enums/common.enum";

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
  const chest = SkeletonUtils.clone(replaceModel.scene.children[0]) as Mesh;
  const oldModel = baseModel.scene.children[0].children[partIndex] as SkinnedMesh;
  
  console.log('base', baseModel);
  console.log('replace', replaceModel);
  
  oldModel.geometry = chest.geometry;
  oldModel.updateMatrix();
}