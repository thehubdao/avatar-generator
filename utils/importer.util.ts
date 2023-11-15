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

function LoadVrmAsync(vrmLoc: string) {
  const loader = ImporterUtil.Instance().GetVrmLoaderInstance();
  return loader.loadAsync(vrmLoc);
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

const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

export async function GetVrmModel(path: string): Promise<Result<GLTF>> {
  const some = await fetch("/VRM/sw.vrm");
  const leBlob = await some.blob();
  const leAB = await leBlob.arrayBuffer();

  const headerView = new DataView( leAB, 0, BINARY_EXTENSION_HEADER_LENGTH );
  const textDecoder = new TextDecoder();

  const header = {
    magic: textDecoder.decode( new Uint8Array( leAB.slice( 0, 4 ) ) ),
    version: headerView.getUint32( 4, true ),
    length: headerView.getUint32( 8, true )
  };
  
  // console.log("SomeDecoding: ", header);

  const chunkContentsLength = header.length - BINARY_EXTENSION_HEADER_LENGTH;
  const chunkView = new DataView( leAB, BINARY_EXTENSION_HEADER_LENGTH );
  let chunkIndex = 0;
  let content: any;
  let body: any;

  while ( chunkIndex < chunkContentsLength ) {
    // console.log("While true!");
    const chunkLength = chunkView.getUint32( chunkIndex, true );
    chunkIndex += 4;

    const chunkType = chunkView.getUint32( chunkIndex, true );
    chunkIndex += 4;

    if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

      const contentArray = new Uint8Array( leAB, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
      content = textDecoder.decode( contentArray );
      // console.log("was json", content)

    } else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

      const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
      body = leAB.slice( byteOffset, byteOffset + chunkLength );
      // console.log("was bin")
    }

    // Clients must ignore chunks with unknown types.

    chunkIndex += chunkLength;

  }
  
  console.log(content, typeof content);
  // console.log(body, typeof body);
  
  const vrmModel = await LoadVrmAsync(path);
  // console.log("VrmGotten: ", vrmModel);

  return {success: true, value: vrmModel};
}