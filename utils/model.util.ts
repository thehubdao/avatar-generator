import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {
  Bone,
  Group,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  Object3D,
  Skeleton,
  SkinnedMesh
} from "three";
import {AccessoryInfoInterface, FeatureBasic, FeatureInfoInterface} from "../interfaces/common.interface";
import {GetToneTexture} from "./threejs/texture.util";
import {LogError, LogWarning} from "./common.util";
import {Module} from "../enums/common.enum";
import {BoneMatrix, MaterialFunction} from "../types/model.type";
import {ChangeMaterialOption} from "../enums/model.enum";
import {TextureTone} from "../types/texture.type";
import {GLOBAL_VALUES} from "../constants/common.constant";

export function IsSkinnedMesh(obj: Object3D): obj is SkinnedMesh {
  return (obj as SkinnedMesh).isSkinnedMesh;
}

export function IsBone(obj: Object3D): obj is Bone {
  return (obj as Bone).isBone;
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

export async function ReplaceModelFeatureOnly(baseModel: Object3D, replaceModel: GLTF, selectedFeature: string, allFeatureInfo: Record<string, FeatureInfoInterface>, skinColor?: string, skinName?: string, changeMaterial?: ChangeMaterialOption) {
  if(allFeatureInfo == undefined) return LogError(Module.ModelUtil, "Missing feature on armature.");
  if(selectedFeature == undefined)
    return LogError(Module.ModelUtil, "There is no selected feature to replace on base model.");
  
  const featureInfo = allFeatureInfo[selectedFeature];
  if (featureInfo == undefined) return LogError(Module.ModelUtil, "Feature not found on avatar base!");
  
  const changeMesh: Object3D | null = await GetMatchPiece(replaceModel, featureInfo.name);
  if(changeMesh == null)
    return LogError(Module.ModelUtil, `Piece not found: '${featureInfo.name}' not found on replace model, please verify the glb file.`);
  
  const newFeature: Object3D = SkeletonUtils.clone(changeMesh);
  const baseSkeleton = GetSkeleton(baseModel, featureInfo.index);
  if (baseSkeleton == undefined)
    return LogError(Module.ModelUtil, "Skeleton missing from base_mesh some of the features have weird components.")

  const changeMaterialFunction = GetChangeMaterialFunction(changeMaterial);
  ChangeSkeleton(newFeature, baseSkeleton, changeMaterialFunction, "threeTone", skinColor, skinName);

  newFeature.frustumCulled = false;
  
  // update all feature info
  for (const fI of Object.values(allFeatureInfo)) {
    if (fI.index > featureInfo.index)
      fI.index -= 1;
  }
  
  baseModel.children.splice(featureInfo.index, 1);
  baseModel.add(newFeature);
  
  featureInfo.index = baseModel.children.length - 1;
  featureInfo.ref = newFeature;
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
      let didFoundObject = false;
      object.scene.traverse(m => {
        if (didFoundObject) return;

        const skinnedMesh = m as SkinnedMesh;
        if (skinnedMesh.isSkinnedMesh) {
          if ((skinnedMesh.parent as Group).isGroup)
            retObj = skinnedMesh.parent;
          else
            retObj = skinnedMesh;

          didFoundObject = true;
          return;
        }
      });
    }

    resolve(retObj);
  });
}

function ChangeSkeleton(newFeature: Object3D, baseSkeleton: Skeleton, changeMaterial?: MaterialFunction, tone?: TextureTone, skinColor?: string, skinMatName = 'Skin _Mat_MAH') {
  newFeature.traverse(async object => {
    if (IsSkinnedMesh(object)) {
      object.skeleton = baseSkeleton.clone();
      if (changeMaterial && tone)
        await changeMaterial(object, tone);

      if (skinColor) {
        const matRef = object.material as MeshStandardMaterial;
        if (matRef.name.startsWith(skinMatName)) {
          matRef.color.set(`#${skinColor}`);
        }
      }
    }

    object.frustumCulled = false;
  });

  // if (IsSkinnedMesh(newFeature)) {
  //   newFeature.skeleton = baseSkeleton.clone();
  //   if (changeMaterial && tone)
  //     await changeMaterial(newFeature, tone);
  // }
}

function FindOrCreateAccessoryGroup(baseModel: Object3D) {
  let accGroup: Group | undefined = undefined;
  let isFoundAccGroup = false;

  baseModel.traverse(object => {
    if (isFoundAccGroup) return;

    if (object.name === GLOBAL_VALUES.AccGroup) {
      isFoundAccGroup = true;
      accGroup = object as Group;
      return;
    }
  });

  if (isFoundAccGroup && accGroup != undefined) return accGroup;

  accGroup = new Group();
  accGroup.name = GLOBAL_VALUES.AccGroup;
  baseModel.add(accGroup);

  return accGroup;
}

function GetChangeMaterialFunction(changeMaterial?: ChangeMaterialOption): MaterialFunction | undefined {
  switch (changeMaterial) {
    case ChangeMaterialOption.Toon:
      return ChangeToToonMaterial;
    default:
      return undefined;
  }
}

export async function ReplaceModelAccessory(baseModel: Object3D, replaceAcc: GLTF, allAccInfo: Record<string, AccessoryInfoInterface>, selectedAcc: string, changeMaterial?: ChangeMaterialOption) {
  // Find valid accessory
  const leAcc = await GetMatchPiece(replaceAcc);
  if (leAcc == null) {
    console.error("Missing valid accessory!");
    return;
  }

  // Get accessory for use
  const newAcc: Object3D = SkeletonUtils.clone(leAcc);
  
  // Find the accessory group, IF doesnt exist, create it
  const accessoryGroup = FindOrCreateAccessoryGroup(baseModel);

  // Find if accInfo has something
  const accInfo = allAccInfo[selectedAcc];
  if (accInfo != undefined) {
    // Remove previous one
    accessoryGroup.children.splice(accInfo.accessoryIndex, 1);

    // Update info
    accInfo.accessoryIndex = accessoryGroup.children.length;
    accInfo.accessoryRef = newAcc;
  } else {
    // Create info
    allAccInfo[selectedAcc] = {
      accessoryIndex: accessoryGroup.children.length,
      accessoryRef: newAcc,
    };
  }

  // Set skeleton
  const newSkeleton = GetSkeleton(accessoryGroup, accInfo?.accessoryIndex ?? -1);
  if (newSkeleton == undefined) {
    console.error('Missing skeleton');
    return;
  }
  
  const changeMaterialFunction = GetChangeMaterialFunction(changeMaterial);
  ChangeSkeleton(newAcc, newSkeleton, changeMaterialFunction, "threeTone");

  // Add new one
  accessoryGroup.add(newAcc);
}

export async function ChangeToToonMaterial(object: SkinnedMesh, tone?: TextureTone) {
  const materialRef = object.material as MeshStandardMaterial;
  if (materialRef.isMeshStandardMaterial) {
    const mapClone = materialRef.map?.clone();
    const oldName = materialRef.name;
    const oldColor = materialRef.color.clone();
    const toneTexture = await GetToneTexture(tone);
    object.material = new MeshToonMaterial({
      map: mapClone,
      name: oldName,
      color: oldColor,
      gradientMap: toneTexture,
      transparent: materialRef.transparent,
    });
  }
}

export function ChangeToBasicMaterial(object: SkinnedMesh) {
  const materialRef = object.material as MeshStandardMaterial;
  if (materialRef.isMeshStandardMaterial) {
    const mapClone = materialRef.map?.clone();
    const oldName = materialRef.name;
    const oldColor = materialRef.color.clone();
    
    object.material = new MeshBasicMaterial({
      map: mapClone,
      name: oldName,
      color: oldColor,
    });
  }
}

export function TransformObject3dToNewMaterial(object: Object3D, tone?: TextureTone, changeMaterial?: ChangeMaterialOption) {
  const changeMaterialFunction = GetChangeMaterialFunction(changeMaterial);
  if (changeMaterialFunction == undefined) return;
  
  object.traverse(subObj => {
    if (IsSkinnedMesh(subObj)) {
      void changeMaterialFunction(subObj, tone);
    }
  });
}

export function ChangeObjectSkinColor(object: Object3D, skinColor: string, skinMatName = 'Skin _Mat_MAH') {
  object.traverse(subObject => {
    if (IsSkinnedMesh(subObject)) {
      const matRef = subObject.material as MeshStandardMaterial;
      if (matRef.name.startsWith(skinMatName)) {
        matRef.color.set(`#${skinColor}`);
      }
    }
  });
}

// TODO: use at some point
// export function CleanModelForExport(model: GLTF) {
//   // something
// }

// TODO Review meshName
export async function GetFeaturesData(baseModel: Group, featureList: FeatureBasic[], update = false) {
  return new Promise<Record<string, FeatureInfoInterface>>(resolve => {
    const baseFeatures = baseModel.children[0];
    const result: Record<string, FeatureInfoInterface> = {};

    for (const [index, feature] of baseFeatures.children.entries()) {
      if (featureList.some(x => feature.name.startsWith(x.meshName))) {
        const foundFeature = featureList.find(x => x.meshName === feature.name);
        if (foundFeature != undefined) {
          result[foundFeature.displayName] = {
            index: index,
            ref: update ? result[foundFeature.displayName].ref : feature.clone(),
            name: foundFeature.meshName
          };
        }
      }
    }

    resolve(result);
  });
}


export function BonesFirst(avatar: GLTF) {
  const root = avatar.scene.children.at(0);
  
  if (root == undefined)
    return void LogError(Module.ModelUtil, "Avatar scene children at position 0 is undefined");

  for (const child of root.children) {
    if (IsBone(child)) {
      const boneIndex = root.children.indexOf(child) + 1;
      root.children.splice(0, 0, child);
      root.children.splice(boneIndex, 1);
      return;
    }
  }
}

export function SetPose(model: Object3D, pose: Record<string, BoneMatrix | undefined> | undefined) {
  if (pose == undefined)
    return void LogWarning(Module.ModelUtil, "Missing pose to update!");

  let sharedSkeleton: Skeleton | undefined;
  
  model.traverse(obj => {
    if (IsSkinnedMesh(obj)) {
      if (sharedSkeleton == undefined)
        sharedSkeleton = obj.skeleton;
      else
        obj.skeleton = sharedSkeleton;
    }

    const matrix = pose[obj.name];
    if (matrix != undefined) {
      obj.matrixAutoUpdate = false;
      obj.position.copy(matrix.p);
      obj.quaternion.copy(matrix.q);
      obj.scale.copy(matrix.s);
      obj.matrixAutoUpdate = true;
    }
  });
}

export function GetPose(model: Object3D) {
  const pose: Record<string, BoneMatrix | undefined> = {};

  model.traverse(obj => {
    pose[obj.name] = {
      p: obj.position.clone(),
      q: obj.quaternion.clone(),
      s: obj.scale.clone(),
    }
  });
  
  return pose;
}