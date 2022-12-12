import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {AccessoryInterface, AnimationInterface, ApiResponse, FeatureInterface} from "../interfaces/api.interface";
import {Group} from "three";
import {GetFile} from "./firebase.util";
import {AccessoryInfoInterface, BasicData, FeatureInfoInterface} from "../interfaces/common.interface";

class ImporterUtil {
  private static _instance: ImporterUtil;
  private _gltfLoader: GLTFLoader | null;
  
  constructor() {
    this._gltfLoader = null;
  }

  public static Instance() {
    if (ImporterUtil._instance === undefined)
      ImporterUtil._instance = new ImporterUtil();

    return ImporterUtil._instance;
  }

  public GetGltfLoaderInstance(): GLTFLoader {
    if(this._gltfLoader === null)
      this._gltfLoader = new GLTFLoader();

    return this._gltfLoader;
  }
}

function ParseAsync(array: ArrayBuffer): Promise<GLTF> {
  const loader = ImporterUtil.Instance().GetGltfLoaderInstance();
  return new Promise<GLTF>((resolve, reject) => {
    loader.parse(array, '',
      (glb) => {
        resolve(glb);
      },
      (error) => {
        reject(error);
      })
  });
}

export async function LoadGltfModel(url: string): Promise<GLTF> {
  const loader = ImporterUtil.Instance().GetGltfLoaderInstance();
  return loader.loadAsync(url);
}

export async function FetchGltfModel(url: string): Promise<GLTF> {
  const arrayBuffer = await FetchArrayBuffer(url);
  return ParseAsync(arrayBuffer);
}

export async function FirebaseGltfModel(path: string, campaign?: string): Promise<GLTF> {
  const arrayBuffer = await GetFile(path, campaign);
  return ParseAsync(arrayBuffer);
}

export async function GetGltfModel(path: string) {
  if(path.startsWith('http'))
    return FetchGltfModel(path);
  else
    return FirebaseGltfModel(path);
}

export async function GetAccessoryBones(baseModel: Group, accessoryBonesList: BasicData[]) {
  return new Promise<Record<string, AccessoryInfoInterface>>((resolve) => {
    const bones = baseModel.children[0];
    let result: Record<string, AccessoryInfoInterface> = {};

    bones.traverse((bone) => {
      if(accessoryBonesList.some(x => x.val === bone.name)) {
        const foundBone = accessoryBonesList.filter(x => x.val === bone.name);
        foundBone.forEach(fb => {
          result[fb.id] = { bone: bone };
        })
      }
    });

    resolve(result);
  });
}

export async function GetFeaturesData(baseModel: Group, featureList: BasicData[], update: boolean = false) {
  return new Promise<Record<string, FeatureInfoInterface>>(resolve => {
    const baseFeatures = baseModel.children[0];
    let result: Record<string, FeatureInfoInterface> = {};

    for(const [index, feature] of baseFeatures.children.entries()) {
      if(featureList.some(x => x.val === feature.name)) {
        const foundFeature = featureList.find(x => x.val === feature.name);
        result[foundFeature!.id] = { featureIndex: index, featureBase: update ? result[foundFeature!.id].featureBase : feature.clone() };
      }
    }

    resolve(result);
  });
}

async function FetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  return fetch(url).then(data => data.arrayBuffer());
}

export async function GetAssetsListByCampaign(campaign?: string | null) {
  const jsonObject: ApiResponse<FeatureInterface[]> = await fetch('/api/getFeatureOptions' + (campaign ? ('?campaign=' + campaign) : '')).then(res => res.json());
  return jsonObject.data;
}

export async function GetAccessoryListByCampaign(campaign?: string | null) {
  const jsonObject: ApiResponse<AccessoryInterface[]> = await fetch('/api/getAccessoryOptions' + (campaign ? ('?campaign=' + campaign) : '')).then(res => res.json());
  return jsonObject.data;
}

export async function GetAnimationListByCampaign(campaign?: string | null) {
  const jsonObject: ApiResponse<AnimationInterface[]> = await fetch('/api/getAnimations' + (campaign ? ('?campaign=' + campaign) : '')).then(res => res.json());
  return jsonObject.data;
}