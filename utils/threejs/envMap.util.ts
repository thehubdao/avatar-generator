import { EquirectangularReflectionMapping, SRGBColorSpace, Texture } from "three";
import { GetTextureFromFile } from "./texture.util";
import { GroundProjectedSkybox } from "three/examples/jsm/objects/GroundProjectedSkybox";

export async function GetEnvironmentMap(textureUrl: string | undefined) {
  const texture = await GetTextureFromFile(textureUrl);
  if (texture == undefined) return;

  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;

  return texture;
}

export function GetSkybox(texture: Texture | undefined, scale?: number, radius?: number, height?: number ) {
  if (texture == undefined) return;

  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;

  const skybox = new GroundProjectedSkybox(texture);
  skybox.scale.setScalar(scale ?? 50);
  skybox.radius = radius ?? 10;
  skybox.height = height ?? 1;
  return skybox;
}