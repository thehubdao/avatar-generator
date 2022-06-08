import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export class ImporterUtil {
  private static gltfLoader: GLTFLoader;

  private static getGltfLoaderInstance() {
    if(ImporterUtil.gltfLoader === undefined)
      ImporterUtil.gltfLoader = new GLTFLoader();

    return ImporterUtil.gltfLoader;
  }

  static async LoadGltfModel(url: string): Promise<GLTF> {
    const loader = this.getGltfLoaderInstance();
    return loader.loadAsync(url);
  }

}