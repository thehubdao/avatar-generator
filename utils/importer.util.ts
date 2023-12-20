import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {GetFile} from "./firebase.util";
import {IsWebUrl, LogError} from "./common.util";
import {Result} from "../types/common.type";
import {CommonErrorCode, Module} from "../enums/common.enum";
import {VRMLoaderPlugin} from "@pixiv/three-vrm";

class ImporterUtil {
  private static _instance: ImporterUtil;
  private _gltfLoader: GLTFLoader | undefined;
  private _vrmLoader: GLTFLoader | undefined;

  public static Instance() {
    if (ImporterUtil._instance === undefined)
      ImporterUtil._instance = new ImporterUtil();

    return ImporterUtil._instance;
  }

  public GetGltfLoaderInstance(): GLTFLoader {
    if (this._gltfLoader == undefined)
      this._gltfLoader = new GLTFLoader();

    return this._gltfLoader;
  }
  
  public GetVrmLoaderInstance(): GLTFLoader {
    if (this._vrmLoader == undefined) {
      this._vrmLoader = new GLTFLoader();
      this._vrmLoader.register((parser) => {
        return new VRMLoaderPlugin(parser);
      });
    }

    return this._vrmLoader;
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

export async function LoadVrmAsync(vrmLoc: string): Promise<Result<GLTF>> {
  try {
    const loader = ImporterUtil.Instance().GetVrmLoaderInstance();
    const vrm = await loader.loadAsync(vrmLoc);
    return {success: true, value: vrm};
  }
  catch (e) {
    const msg = "Error loading VRM asset!";
    void LogError(Module.Importer, msg);
    return {success: false, errMessage: msg, errCode: CommonErrorCode.InternalError};
  }
}

export async function LoadGltfModel(url: string): Promise<GLTF> {
  const loader = ImporterUtil.Instance().GetGltfLoaderInstance();
  return loader.loadAsync(url);
}

export async function FetchGltfModel(url: string): Promise<Result<GLTF>> {
  try {
    const arrayBuffer = await FetchArrayBuffer(url);
    const parsed = await ParseAsync(arrayBuffer);
    return {success: true, value: parsed};
  }
  catch(err) {
    const msg = "Error while fetching external model file!";
    void LogError(Module.Importer, msg, err);
    return {success: false, errMessage: msg, errCode: CommonErrorCode.FetchError};
  }
}

export async function FirebaseGltfModel(path: string, campaign?: string): Promise<Result<GLTF>> {
  const fileResult = await GetFile(path, campaign);
  if (fileResult.success) {
    const gltf = await ParseAsync(fileResult.value);
    gltf.scene.traverse(obj => {
      obj.castShadow = true;
      // TODO: Add envMapIntensity from campaignConfig
      // obj.material.envMapIntensity = 7;
    })
    return {success: true, value: gltf};
  }
  
  return fileResult;
}

export async function GetGltfModel(path: string): Promise<Result<GLTF>> {
  if (IsWebUrl(path))
    return FetchGltfModel(path);
  else
    return FirebaseGltfModel(path);
}

async function FetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  return fetch(url).then(data => data.arrayBuffer());
}
