import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ImporterUtil} from "./importer.util";
import {clone, getBones} from "three/examples/jsm/utils/SkeletonUtils";
import {Mesh, SkinnedMesh} from "three";
import {BodyPartTypeEnum} from "../enums/common.enum";

export async function ReplaceModelPart(baseModel: GLTF, partUrl: string, partIndex: number) {
  const partModel = await ImporterUtil.LoadGltfModel(partUrl);
  
  const chest = clone(partModel.scene.children[0].children[partIndex]) as SkinnedMesh;
  const oldSkeleton = getBones((baseModel.scene.children[0].children[partIndex] as SkinnedMesh).skeleton);

  chest.skeleton.bones = oldSkeleton;

  baseModel.scene.children[0].children[partIndex] = chest;
}

export async function ReplaceModelPartOnly(baseModel: GLTF, replaceModel: GLTF, partIndex: BodyPartTypeEnum) {
  const chest = clone(replaceModel.scene.children[0].children[1]) as Mesh;
  const oldModel = baseModel.scene.children[0].children[partIndex] as SkinnedMesh;
  
  console.log('base', baseModel);
  console.log('replace', replaceModel);
  
  oldModel.geometry = chest.geometry;
  oldModel.updateMatrix();
}