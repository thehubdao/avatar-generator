import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ImporterUtil} from "./importer.util";
import {clone, getBones} from "three/examples/jsm/utils/SkeletonUtils";
import {SkinnedMesh} from "three";

export async function ReplaceModelPart(baseModel: GLTF, partUrl: string, partIndex: number) {
  const partModel = await ImporterUtil.LoadGltfModel(partUrl);
  
  const chest = clone(partModel.scene.children[0].children[partIndex]) as SkinnedMesh;
  const oldSkeleton = getBones((baseModel.scene.children[0].children[partIndex] as SkinnedMesh).skeleton);

  chest.skeleton.bones = oldSkeleton;

  baseModel.scene.children[0].children[partIndex] = chest;
}