import { EquirectangularReflectionMapping, Object3D, SRGBColorSpace, Texture } from "three";
import { GetTextureFromFile } from "./texture.util";
import { GroundProjectedSkybox } from "three/examples/jsm/objects/GroundProjectedSkybox";
import { Result } from "../../types/common.type";
import { ConfigSkybox } from "../../interfaces/envMap.interface";

export async function GetEnvironmentMap(envMap: string, skyboxConfig?: ConfigSkybox): Promise<Result<{ texture: Texture, skybox: Object3D | undefined }>> {
  const envTexture = await GetTextureFromFile(envMap);

  if (!envTexture.success)
    return envTexture;

  envTexture.value.mapping = EquirectangularReflectionMapping;
  envTexture.value.colorSpace = SRGBColorSpace;

  let skybox;
  if (skyboxConfig) {
    skybox = new GroundProjectedSkybox(envTexture.value);
    skybox.scale.setScalar(skyboxConfig.scale);
    skybox.radius = skyboxConfig.radius;
    skybox.height = skyboxConfig.height;
  }

  return { success: true, value: { texture: envTexture.value, skybox: skybox } };
}