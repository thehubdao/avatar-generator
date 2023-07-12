import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {GetFile} from "./firebase.util";
import {IsWebUrl} from "./common.util";

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
    if (this._gltfLoader === null)
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
  if (IsWebUrl(path))
    return FetchGltfModel(path);
  else
    return FirebaseGltfModel(path);
}

async function FetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  return fetch(url).then(data => data.arrayBuffer());
}