import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {BodyPartTypeEnum} from "../enums/common.enum";
import {BodyPartLocationApi} from "../interfaces/api.interface";
import {apiUrl} from "./globals.util";

export class ImporterUtil {
  private static gltfLoader: GLTFLoader;

  private static getGltfLoaderInstance(): GLTFLoader {
    if(ImporterUtil.gltfLoader === undefined)
      ImporterUtil.gltfLoader = new GLTFLoader();

    return ImporterUtil.gltfLoader;
  }
  
  private static parseAsync(array: ArrayBuffer): Promise<GLTF> {
    const loader = this.getGltfLoaderInstance();
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
  

  static async LoadGltfModel(url: string): Promise<GLTF> {
    const loader = this.getGltfLoaderInstance();
    return loader.loadAsync(url);
  }
  
  static async FetchGltfModel(url: string): Promise<GLTF> {
    const arrayBuffer = await FetchArrayBuffer(url);
    return this.parseAsync(arrayBuffer);
  }

}

async function FetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const fetchData = await fetch(url);
  return fetchData.arrayBuffer();
}

export async function GetAssetsListByType(bodyPartType: BodyPartTypeEnum) {
  const jsonObject: BodyPartLocationApi[] = 
    await fetch(apiUrl)
      .then(res => res.json());
  
  return jsonObject.filter(x => x.type === bodyPartType);
}