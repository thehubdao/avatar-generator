import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {BodyPartTypeEnum} from "../enums/common.enum";
import {BodyPartLocationApi} from "../interfaces/api.interface";
import {accessoryBones} from "./globals.util";
import {Group} from "three";
import {AccessoryInfoInterface} from "../interfaces/accessory-parts.interface";
import {FirebaseUtil} from "./firebase.util";

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

  static async FirebaseGltfModel(url: string): Promise<GLTF> {
    const arrayBuffer = await FirebaseUtil.Instance().GetFile(url);
    return this.parseAsync(arrayBuffer);
  }

}

export function GetAccessoryBones(baseModel: Group): Record<string, AccessoryInfoInterface> {
  const bones = baseModel.children[0].children[0];
  let result: Record<string, AccessoryInfoInterface> = {};
  
  bones.traverse((bone) => {
    if(accessoryBones.some(x => x.boneName === bone.name)) {
      const foundBone = accessoryBones.find(x => x.boneName === bone.name);
      result[foundBone!.partType] = { bone: bone };
    }
  });
  
  return result;
}

async function FetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  return fetch(url).then(data => data.arrayBuffer());
}

export async function GetAssetsListByCampaign(campaign?: string) {
  const jsonObject: BodyPartLocationApi[] = await fetch('api/getParts' + (campaign ? ('?campaign=' + campaign) : '')).then(res => res.json());
  return jsonObject;
}
