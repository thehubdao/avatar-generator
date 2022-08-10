import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ImporterUtil} from "./importer.util";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {
  Group, Material,
  Mesh,
  MeshStandardMaterial,
  MeshToonMaterial,
  Object3D, Skeleton,
  SkinnedMesh
} from "three";
import {AccessoryInfoInterface, BasicData, PartInfoInterface} from "../interfaces/common.interface";
import {TextureTone, TextureUtil} from "./texture.util";

export async function ReplaceModelPart(baseModel: GLTF, partUrl: string, partIndex: number) {
  const partModel = await ImporterUtil.LoadGltfModel(partUrl);
  
  // @ts-ignore
  const chest = SkeletonUtils.clone(partModel.scene.children[0].children[partIndex]) as SkinnedMesh;
  // @ts-ignore
  const oldSkeleton = SkeletonUtils.getBones((baseModel.scene.children[0].children[partIndex] as SkinnedMesh).skeleton);

  chest.skeleton.bones = oldSkeleton;

  baseModel.scene.children[0].children[partIndex] = chest;
}

export async function ReplaceModelPartOnly(baseModel: Object3D, replaceModel: GLTF, partInfo: PartInfoInterface, selectedPart?: BasicData, skinColor?: string) {
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
    console.error('Piece not found:', `'${selectedPart.value}' not found on replace model, please verify the glb file.`);
    return;
  }
  
  // @ts-ignore
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
    console.error('Skeleton Missing:', 'Skeleton missing from base_mesh some of the parts have weird components.', basePartRef);
    return;
  }
  
  if((newPart as Group).isGroup) {
    newPart.traverse( async object => {
      if((object as SkinnedMesh).isSkinnedMesh) {
        (object as SkinnedMesh).skeleton = baseSkeleton.clone();
        await ChangeToToonMaterial(object as SkinnedMesh);
      }
    });
  }
  
  if((newPart as SkinnedMesh).isSkinnedMesh) {
    (newPart as SkinnedMesh).skeleton = baseSkeleton.clone();
    await ChangeToToonMaterial(newPart as SkinnedMesh);
  }
  
  if(skinColor)
    ChangeObjectSkinColor(newPart, skinColor);
  
  console.log('base', baseModel);
  console.log('replace', newPart);
  console.log('partInfo', partInfo);
  
  baseModel.children.splice(partInfo.partIndex, 1);
  baseModel.add(newPart);
}

export function ReplaceModelAccessory(accessoriesInfo: Record<string, AccessoryInfoInterface>, selectedAcc: string, accessory: GLTF) {
  const bone = accessoriesInfo[selectedAcc];
  const accessoryMesh = accessory.scene.children[0].clone() as Mesh;
  accessoryMesh.scale.set(0.1, 0.1, 0.1);

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
    const _toneTexture = await TextureUtil.GetToneTexture(tone);
    object.material = new MeshToonMaterial({
      map: mapClone,
      name: oldName,
      gradientMap: _toneTexture,
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

export function ChangeObjectSkinColor(object: Object3D, skinColor: string, skinMatName: string = 'AvatarSkin_MAT') {
  object.traverse(subObject => {
    const objectRef = subObject as SkinnedMesh;
    if(objectRef.isSkinnedMesh) {
      const matRef = objectRef.material as Material;
      if(matRef.name === skinMatName)
        (matRef as MeshStandardMaterial).color.set(`#${skinColor}`);
    }
  });
}