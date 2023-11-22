import { LogError } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { AnimationMixer } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { GetGltfModel } from "../../utils/importer.util";
import { CreateAnimationMixer, SetAnimation } from "../../utils/threejs/animation.util";
import {
  ChangeObjectSkinColor,
  GetFeaturesData,
  ReplaceModelAccessory,
  ReplaceModelFeatureOnly,
  TransformObject3dToNewMaterial,
  BonesFirst,
  GetPose
} from "../../utils/model.util";
import {
  AccessoryInfoInterface,
  FeatureBasic,
  FeatureInfoInterface,
  LookAtVectors
} from "../../interfaces/common.interface";
import { ExportModelGlb, ExportModelVrm } from "../../utils/exporter.util";
import AvatarViewer, { AddBackgroundScene, AddComposer, AddLightEnvScene, AddMixer, AddToScene, RemoveFromScene } from "./viewer.component";
import { ChangeMaterialOption } from "../../enums/model.enum";
import { BoneMatrix } from "../../types/model.type";
import { ShowModal } from "../../utils/modal.util";
import { Result } from "../../types/common.type";
import { GetLights } from "../../utils/threejs/light.util";
import { ConfigLight } from "../../interfaces/light.interface";
import { GetShadow } from "../../utils/threejs/shadow.util";
import { ConfigSkybox } from "../../interfaces/envMap.interface";
import { GetEnvironmentMap } from "../../utils/threejs/envMap.util";
import { ConfigShadow } from "../../interfaces/shadow.interface";
import {GLOBAL_VALUES} from "../../constants/common.constant";
import { ConfigPostProcessing } from "../../interfaces/postProcessing.interface";


//#region Logic

let _avatar: GLTF | undefined;
let _mixer: AnimationMixer | undefined;

const _savedModels: Record<string, GLTF> = {};
const _accessoryListData: Record<string, AccessoryInfoInterface> = {};
let _featureListData: Record<string, FeatureInfoInterface> | undefined;
let _startPose: Record<string, BoneMatrix | undefined> | undefined;

export async function ChangeSkinColor(newSkinColor: string, skinName?: string) {
  if (_avatar == undefined) 
    return LogError(Module.Editor, "Missing armature for skin color change");

  ChangeObjectSkinColor(_avatar.scene, newSkinColor, skinName);
}

export async function GetWearableOption(id: string, optionPath: string): Promise<Result<GLTF>> {
  let replaceModel: GLTF;
  if (_savedModels[id]) {
    replaceModel = _savedModels[id];
  } else {
    const getModelResult = await GetGltfModel(optionPath);
    if (!getModelResult.success)
      return getModelResult;

    replaceModel = getModelResult.value;
    _savedModels[id] = replaceModel;
  }

  return { success: true, value: replaceModel };
}

export async function ChangeFeature(id: string, featurePath: string, name: string, selectedFeature: string, skinColor?: string, skinName?: string, changeMaterial?: ChangeMaterialOption) {
  if (_avatar == undefined) return LogError(Module.Editor, "Missing armature in order to change feature");
  if (_featureListData == undefined) return LogError(Module.Editor, "Missing feature list data");

  const replaceModel = await GetWearableOption(id, featurePath);
  if (!replaceModel.success)
    return LogError(Module.Editor, replaceModel.errMessage); // TODO: do something when wearable result didn't succeed

  await ReplaceModelFeatureOnly(_avatar.scene.children[0], replaceModel.value, selectedFeature, _featureListData, skinColor, skinName, changeMaterial);
  // console.log('Avatar:', _avatar);
}

export async function ChangeAccessory(id: string, path: string, name: string, selectedAcc: string, changeMaterial?: ChangeMaterialOption) {
  if (_avatar == undefined) return LogError(Module.Editor, "Missing armature in order to change accessory!");

  const replaceModel = await GetWearableOption(id, path);
  if (!replaceModel.success)
    return LogError(Module.Editor, replaceModel.errMessage); // TODO: do something when wearable result didn't succeed

  await ReplaceModelAccessory(_avatar.scene.children[0], replaceModel.value, _accessoryListData, selectedAcc, changeMaterial);
}

export async function ChangeStartAnimation(startAnimation: string | undefined) {
  if (_mixer == undefined) return LogError(Module.Editor, "Missing animation mixer!");

  await SetAnimation(_mixer, startAnimation);
}

export async function SetStage(path?: string) {
  if (path == undefined) return;

  const stage = await GetWearableOption(GLOBAL_VALUES.StageId, path);
  if (!stage.success)
    return; // TODO: do something when stage result didn't succeed

  AddToScene(stage.value.scene, GLOBAL_VALUES.StageId);
}

export function RemoveStage() {
  RemoveFromScene(GLOBAL_VALUES.StageId);
}

export async function SetFeaturesData(selectListFeatures: FeatureBasic[]) {
  if (_avatar == undefined) return LogError(Module.Editor, "Missing armature!");

  _featureListData = await GetFeaturesData(_avatar.scene, selectListFeatures);
}

export async function SetEnvironment(bgMap?: string, lightMap?: string, skyboxConfig?: ConfigSkybox) {
  if (bgMap) {
    const bgTexture = await GetEnvironmentMap(bgMap, skyboxConfig);
    if (!bgTexture.success) 
      void ShowModal("Sorry, An error occurred while creating the background environment!"); // TODO: this modal should be a snackbar without buttons
    else {
      AddBackgroundScene(bgTexture.value.texture);
      if (bgTexture.value.skybox)
        AddToScene(bgTexture.value.skybox);
    }
  }

  if (lightMap) {
    const result = await GetEnvironmentMap(lightMap);
    if (!result.success) 
      void ShowModal("Sorry, An error occurred while creating the light environment!"); // TODO: this modal should be a snackbar without buttons
    else 
      AddLightEnvScene(result.value.texture);
  }
}

export async function GetAvatarGLB() {
  return ExportModelGlb(_avatar, _startPose);
}

export async function GetAvatarVRM() {
  return ExportModelVrm(_avatar, _startPose);
}

//#endregion

//#region Component

interface AvatarEditorProps {
  avatarBasePath: string;
  onReady: () => Promise<void>;
  changeMaterial?: ChangeMaterialOption;
  lights?: ConfigLight[];
  postProcessing?: ConfigPostProcessing[];
  defaultShadow?: ConfigShadow;
  defaultCamera?: LookAtVectors;
  editMode?: boolean;
  enablePan?: boolean;
}

/***
 * Component with all the feature and accessory switching.
 * Will hold the information and send it to a viewer.
 * @component
 */
export default function AvatarEditor({ avatarBasePath, onReady, changeMaterial, lights, postProcessing, defaultShadow, defaultCamera, editMode, enablePan }: AvatarEditorProps) {
  async function onAvatarEditorReady() {
    await initEditor();

    await onReady();
  }

  async function initEditor() {
    const leLights = GetLights(lights);
    for (const light of leLights) {
      AddToScene(light);
    }

    if (defaultShadow != undefined) {
      const leShadow = GetShadow(defaultShadow);
      if (leShadow != undefined) {
        AddToScene(leShadow.shadowLight);
        AddToScene(leShadow.shadowPlane);
      }
    }

    const getAvatarBaseResult = await GetGltfModel(avatarBasePath);
    if (!getAvatarBaseResult.success) {
      ShowModal(getAvatarBaseResult.errMessage);
      return;
    }

    if (postProcessing)
      AddComposer(postProcessing);

    _avatar = getAvatarBaseResult.value;
    BonesFirst(_avatar);
    _startPose = GetPose(_avatar.scene);

    _mixer = CreateAnimationMixer(_avatar.scene);
    await SetAnimation(_mixer, _avatar, undefined);

    TransformObject3dToNewMaterial(_avatar.scene, undefined, changeMaterial);
    AddToScene(_avatar.scene);
    AddMixer(_mixer);
  }

  return (
    <AvatarViewer 
      onReady={() => onAvatarEditorReady()}
      defaultCamPos={defaultCamera?.pos}
      defaultCamLookAt={defaultCamera?.lookAt}
      editMode={editMode}
      enablePan={enablePan}
    />
  );
}

//#endregion