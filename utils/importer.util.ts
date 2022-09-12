import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {AccLocationApi, AnimLocationApi, BodyPartLocationApi} from "../interfaces/api.interface";
import {Group} from "three";
import {GetFile} from "./firebase.util";
import {AccessoryInfoInterface, BasicData, PartInfoInterface} from "../interfaces/common.interface";

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

  static async FirebaseGltfModel(path: string): Promise<GLTF> {
    const arrayBuffer = await GetFile(path);
    return this.parseAsync(arrayBuffer);
  }

}

export function GetAccessoryBones(baseModel: Group, accessoryBonesList: BasicData[]): Record<string, AccessoryInfoInterface> {
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
  
  return result;
}

export function GetPartsData(baseModel: Group, partList: BasicData[], update: boolean = false): Record<string, PartInfoInterface> {
  const baseParts = baseModel.children[0];
  let result: Record<string, PartInfoInterface> = {};
  
  baseParts.children.forEach((part, index) => {
    if(partList.some(x => x.val === part.name)) {
      const foundPart = partList.find(x => x.val === part.name);
      result[foundPart!.id] = { partIndex: index, featureBase: update ? result[foundPart!.id].featureBase : part.clone() };
    }
  });

  return result;
}

async function FetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  return fetch(url).then(data => data.arrayBuffer());
}

export async function GetAssetsListByCampaign(campaign?: string | null) {
  const jsonObject: BodyPartLocationApi[] = await fetch('api/getParts' + (campaign ? ('?campaign=' + campaign) : '')).then(res => res.json());
  return jsonObject;
}

export async function GetAccessoryListByCampaign(campaign?: string | null) {
  const jsonObject: AccLocationApi[] = await fetch('api/getAccessories' + (campaign ? ('?campaign=' + campaign) : '')).then(res => res.json());
  return jsonObject;
}

export async function GetAnimationListByCampaign(campaign?: string | null) {
  const jsonObject: AnimLocationApi[] = await fetch('api/getAnimations' + (campaign ? ('?campaign=' + campaign) : '')).then(res => res.json());
  return jsonObject;
}