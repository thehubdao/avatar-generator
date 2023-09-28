import { Mesh, PlaneGeometry, ShadowMaterial } from "three";
import { ShadowType } from "../../enums/light.enum";
import { ConfigShadow } from "../../interfaces/light.interface";
import { GenerateShadowLight } from "./light.util";
import { AGVector3 } from "../../interfaces/common.interface";

export function GetShadow(configShadow: ConfigShadow | undefined) {
  if (configShadow == undefined) return;
  
  switch (configShadow.type) {
    case ShadowType.Dynamic:
      return GenerateDynamicShadow(configShadow.lightPos);
    default:
     return;
  }
}

function GenerateDynamicShadow(lightPos: AGVector3) {
  const geometry = new PlaneGeometry(10, 10);
  geometry.rotateX(- Math.PI / 2);
  const material = new ShadowMaterial();
  material.opacity = 0.2;
  const shadowPlane = new Mesh(geometry, material);
  shadowPlane.position.y = 0;
  shadowPlane.receiveShadow = true;
  const shadowLight = GenerateShadowLight(lightPos);
  return {shadowPlane, shadowLight};
}

// TODO: Create a plane with a circle shadow texture
// function GenerateStaticShadow() {
// }