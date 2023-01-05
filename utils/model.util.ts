import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {
  Group,
  Material,
  MeshStandardMaterial,
  MeshToonMaterial,
  Object3D,
  Skeleton,
  SkinnedMesh
} from "three";
import {AccessoryInfoInterface, BasicData, PartInfoInterface} from "../interfaces/common.interface";
import {TextureTone, TextureUtil} from "./texture.util";
import {LoadGltfModel} from "./importer.util";
import {GlobalValues} from "../enums/common.enum";

type MaterialFunction = (obj: SkinnedMesh, tone?: TextureTone) => void;

export async function ReplaceModelPart(baseModel: GLTF, partUrl: string, partIndex: number) {
  const partModel = await LoadGltfModel(partUrl);

  const chest = SkeletonUtils.clone(partModel.scene.children[0].children[partIndex]) as SkinnedMesh;
  const oldSkeleton = SkeletonUtils.getBones((baseModel.scene.children[0].children[partIndex] as SkinnedMesh).skeleton);

  chest.skeleton.bones = oldSkeleton;

  baseModel.scene.children[0].children[partIndex] = chest;
}

function IsSkinnedMesh(obj: Object3D): obj is SkinnedMesh {
  return (obj as SkinnedMesh).isSkinnedMesh;
}

function GetSkeleton(skeletonModel: Object3D, index: number) {
  const basePartRef = skeletonModel.children.at(index);

  if (basePartRef != undefined) {
    if (IsSkinnedMesh(basePartRef)) {
      return basePartRef.skeleton;
    } else if ((basePartRef as Group).isGroup) {
      return (basePartRef.children[0] as SkinnedMesh).skeleton;
    }
  }

  let rootRef = skeletonModel;
  if (rootRef.parent != null)
    rootRef = rootRef.parent;

  let leSkelly: Skeleton | undefined = undefined;

  rootRef.traverse(obj => {
    if (IsSkinnedMesh(obj)) {
      leSkelly = obj.skeleton;
      return;
    }
  });

  return leSkelly;
}

export async function ReplaceModelPartOnly(baseModel: Object3D, replaceModel: GLTF, partInfo: PartInfoInterface, selectedPart?: BasicData, skinColor?: string) {
  if (selectedPart == undefined) {
    console.error('No selected Part', 'There is no selected part to replace on base model.');
    return;
  }

  let chestMesh = await GetMatchPiece(replaceModel, selectedPart.val);
  if (chestMesh == null) {
    console.error('Piece not found:', `'${selectedPart.val}' not found on replace model, please verify the glb file.`);
    return;
  }

  const newPart: Object3D = SkeletonUtils.clone(chestMesh);
  const baseSkeleton = GetSkeleton(baseModel, partInfo.partIndex);
  if (baseSkeleton == undefined) {
    console.error('Skeleton Missing:', 'Skeleton missing from base_mesh some of the parts have weird components.');
    return;
  }

  await ChangeSkeleton(newPart, baseSkeleton, ChangeToToonMaterial, "threeTone");

  if (skinColor) {
    await ChangeObjectSkinColor(newPart, skinColor);
  }

  // console.log('base', baseModel);
  // console.log('replace', newPart);
  // console.log('partInfo', partInfo);

  newPart.frustumCulled = false;
  baseModel.children.splice(partInfo.partIndex, 1);
  baseModel.add(newPart);
}

async function GetMatchPiece(object: GLTF, match?: string) {
  return new Promise<Object3D | null>((resolve) => {
    let retObj: Object3D | null = null;
    if (match != undefined) {
      object.scene.traverse(m => {
        if (m.name === match) {
          retObj = m;
        }
      });
    }

    if (retObj == null) {
      let objectFound = false;
      object.scene.traverse(m => {
        if (objectFound) return;

        const skinnedMesh = m as SkinnedMesh;
        if (skinnedMesh.isSkinnedMesh) {
          if ((skinnedMesh.parent as Group).isGroup)
            retObj = skinnedMesh.parent;
          else
            retObj = skinnedMesh;

          objectFound = true;
          return;
        }
      });
    }

    resolve(retObj);
  });
}

async function ChangeSkeleton(newPart: Object3D, baseSkeleton: Skeleton, changeMaterial?: MaterialFunction, tone?: TextureTone) {
  if ((newPart as Group).isGroup) {
    newPart.traverse(async object => {
      if (IsSkinnedMesh(object)) {
        object.skeleton = baseSkeleton.clone();
        if (changeMaterial && tone)
          await changeMaterial(object, tone);
      }

      object.frustumCulled = false;
    });
  }

  if (IsSkinnedMesh(newPart)) {
    newPart.skeleton = baseSkeleton.clone();
    if (changeMaterial && tone)
      await changeMaterial(newPart, tone);
  }
}

function FindOrCreateAccessoryGroup(baseModel: Object3D) {
  baseModel.traverse(object => {
    if (object.name === GlobalValues.AccGroup) {
      return object as Group;
    }
  });

  const accGroup = new Group();
  accGroup.name = GlobalValues.AccGroup;
  baseModel.add(accGroup);

  return accGroup;
}

export async function ReplaceModelAccessory(baseModel: Object3D, replaceAcc: GLTF, allAccInfo: Record<string, AccessoryInfoInterface>, selectedAcc: string) {
  // Find valid accessory
  const leAcc = await GetMatchPiece(replaceAcc);
  if (leAcc == null) {
    console.error("Missing valid accessory!");
    return;
  }

  // Get accessory for use

  // Find the accessory group, IF doesnt exist, create it
  const accessoryGroup = FindOrCreateAccessoryGroup(baseModel);

  // Find if accInfo has something
  const accInfo = allAccInfo[selectedAcc];
  if (accInfo != undefined) {
    // Remove previous one
    accessoryGroup.children.splice(accInfo.accessoryIndex, 1);

    // Update info
    accInfo.accessoryIndex = accessoryGroup.children.length;
    accInfo.accessoryRef = leAcc;
  } else {
    // Create info
    allAccInfo[selectedAcc] = {
      accessoryIndex: accessoryGroup.children.length,
      accessoryRef: leAcc,
    };
  }

  // Set skeleton
  const newSkeleton = GetSkeleton(accessoryGroup, accInfo?.accessoryIndex ?? -1);
  if (newSkeleton == undefined) {
    console.error('Missing skeleton');
    return;
  }
  await ChangeSkeleton(leAcc, newSkeleton);

  // Add new one
  accessoryGroup.add(leAcc);

  console.log('leModel', baseModel);
}

export async function ChangeToToonMaterial(object: SkinnedMesh, tone?: TextureTone) {
  const materialRef = object.material as MeshStandardMaterial;
  if (materialRef.isMeshStandardMaterial) {
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
    if (skinnedRef.isSkinnedMesh) {
      await ChangeToToonMaterial(skinnedRef, tone);
    }
  });
}

export async function ChangeObjectSkinColor(object: Object3D, skinColor: string, skinMatName: string = 'AvatarSkin_MAT') {
  object.traverse(subObject => {
    const objectRef = subObject as SkinnedMesh;
    if (objectRef.isSkinnedMesh) {
      const matRef = objectRef.material as Material;
      if (matRef.name.startsWith(skinMatName))
        (matRef as MeshStandardMaterial).color.set(`#${skinColor}`);
    }
  });
}

export function CleanModelForExport(model: GLTF) {
  // TODO: something
}