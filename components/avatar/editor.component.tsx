import {LogError} from "../../utils/common.util";
import {GlobalValues, Module} from "../../enums/common.enum";
import {AnimationMixer} from "three";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GetGltfModel} from "../../utils/importer.util";
import {CreateAnimationMixer, SetAnimation} from "../../utils/threejs/animation.util";
import {
  ChangeObjectSkinColor,
  GetFeaturesData,
  ReplaceModelAccessory,
  ReplaceModelFeatureOnly,
  TransformObject3dToToonMaterial
} from "../../utils/model.util";
import {
  AccessoryInfoInterface,
  BasicData,
  FeatureInfoInterface,
  LookAtVectors
} from "../../interfaces/common.interface";
import {ExportModelGlb} from "../../utils/exporter.util";
import AvatarViewer, {AddMixer, AddToScene, RemoveFromScene, SetEnvironmentMap} from "./viewer.component";
import {ChangeMaterialOption} from "../../enums/model.enum";
import {ConfigLight} from "../../interfaces/light.interface";
import {GetLights} from "../../utils/threejs/light.util";


//#region Logic

let _avatar: GLTF | undefined;
let _mixer: AnimationMixer | undefined;

const _savedModels: Record<string, GLTF> = {};
const _accessoryListData: Record<string, AccessoryInfoInterface> = {};
let _featureListData: Record<string, FeatureInfoInterface> | undefined;

export async function ChangeSkinColor(newSkinColor: string, skinName?: string) {
  if (_avatar == undefined) return LogError(Module.Editor, "Missing armature for skin color change");

  await ChangeObjectSkinColor(_avatar.scene, newSkinColor, skinName);
}

export async function GetWearableOption(id: string, optionPath: string) {
  let replaceModel: GLTF;
  if (_savedModels[id]) {
    replaceModel = _savedModels[id];
  } else {
    replaceModel = await GetGltfModel(optionPath);
    _savedModels[id] = replaceModel;
  }

  return replaceModel;
}

export async function ChangeFeature(id: string, featurePath: string, name: string, selectedFeature: string, skinColor?: string, skinName?: string, changeMaterial?: ChangeMaterialOption) {
  if (_avatar == undefined) return LogError(Module.Editor, "Missing armature in order to change feature");
  if (_featureListData == undefined) return LogError(Module.Editor, "Missing feature list data");

  const replaceModel = await GetWearableOption(id, featurePath);

  await ReplaceModelFeatureOnly(_avatar.scene.children[0], replaceModel, selectedFeature, _featureListData, skinColor, skinName, changeMaterial);
  // console.log('Avatar:', _avatar);
}

export async function ChangeAccessory(id: string, path: string, name: string, selectedAcc: string, changeMaterial?: ChangeMaterialOption) {
  if (_avatar == undefined) return LogError(Module.Editor, "Missing armature in order to change accessory!");

  const replaceModel = await GetWearableOption(id, path);
  await ReplaceModelAccessory(_avatar.scene.children[0], replaceModel, _accessoryListData, selectedAcc, changeMaterial);
}

export async function ChangeStartAnimation(startAnimation: string | undefined) {
  if (_mixer == undefined) return LogError(Module.Editor, "Missing animation mixer!");

  await SetAnimation(_mixer, startAnimation);
}

export async function SetEnvironment(path?: string) {
  if (path == undefined) return;
  
  const environment = await GetWearableOption(GlobalValues.EnvironmentId, path);
  AddToScene(environment.scene, GlobalValues.EnvironmentId);
}

export function RemoveEnvironment() {
  RemoveFromScene(GlobalValues.EnvironmentId);
}

export async function SetFeaturesData(selectListFeatures: BasicData[]) {
  if (_avatar == undefined) return LogError(Module.Editor, "Missing armature!");

  _featureListData = await GetFeaturesData(_avatar.scene, selectListFeatures);
}

export async function GetAvatarGLB() {
  if (_avatar == undefined) return void LogError(Module.Editor, "Missing Avatar for export!");

  return ExportModelGlb(_avatar);
}

//#endregion

//#region Component

interface AvatarEditorProps {
  avatarBasePath: string;
  onReady: () => Promise<void>;
  changeMaterial?: ChangeMaterialOption;
  lights?: ConfigLight[];
  defaultCamera?: LookAtVectors;
  envMap?: string;
}

/***
 * Component with all the feature and accessory switching.
 * Will hold the information and send it to a viewer.
 * @component
 */
export default function AvatarEditor({avatarBasePath, onReady, changeMaterial, lights, defaultCamera, envMap}: AvatarEditorProps) {
  async function onAvatarEditorReady() {
    await initEditor();

    await onReady();
  }

  async function initEditor() {
    await SetEnvironmentMap(envMap);
    
    const leLights = GetLights(lights);
    for (const light of leLights) {
      AddToScene(light);
    }

    _avatar = await GetGltfModel(avatarBasePath);

    _mixer = CreateAnimationMixer(_avatar.scene);
    await SetAnimation(_mixer, _avatar, undefined);

    await TransformObject3dToToonMaterial(_avatar.scene, undefined, changeMaterial);
    AddToScene(_avatar.scene);
    AddMixer(_mixer);
  }

  return (
    <AvatarViewer onReady={() => onAvatarEditorReady()}
                  defaultCamPos={defaultCamera?.pos}
                  defaultCamLookAt={defaultCamera?.lookAt}
    />
  );
}

//#endregion