import { EquirectangularReflectionMapping, Object3D, SRGBColorSpace, Texture } from "three";
import { GetTextureFromFile } from "./texture.util";
import { GroundProjectedSkybox } from "three/examples/jsm/objects/GroundProjectedSkybox";
import { EnvMapInterface } from "../../interfaces/api.interface";
import { Result } from "../../types/common.type";
import { ConfigSkybox } from "../../interfaces/envMap.interface";

export async function GetEnvironmentMap(envMapList: EnvMapInterface[], envMap: string, skyboxConfig?: ConfigSkybox): Promise<Result<{ texture: Texture, skybox: Object3D | undefined }>> {
  const map = envMapList?.find(em => em.name === envMap);
  const envTexture = await GetTextureFromFile(map?.path);

  if (!envTexture.success)
    return envTexture;

  envTexture.value.mapping = EquirectangularReflectionMapping;
  envTexture.value.colorSpace = SRGBColorSpace;

  let skybox;
  if (skyboxConfig) {
    skybox = new GroundProjectedSkybox(envTexture.value);
    skybox.scale.setScalar(skyboxConfig.scale ?? 50);
    skybox.radius = skyboxConfig.radius ?? 10;
    skybox.height = skyboxConfig.height ?? 1;
  }

  return { success: true, value: { texture: envTexture.value, skybox: skybox } };
}