import { Mesh, PlaneGeometry, PointLight, ShadowMaterial } from "three";
import { AGVector3 } from "../../interfaces/common.interface";
import { ConfigShadow } from "../../interfaces/shadow.interface";
import { ShadowType } from "../../enums/shadow.enum";

export function GetShadow(configShadow: ConfigShadow | undefined) {
  if (configShadow == undefined) return;
  
  switch (configShadow.type) {
    case ShadowType.Dynamic:
      return GenerateDynamicShadow(configShadow.lightPos);
    default:
     return;
  }
}

function GenerateShadowLight(lightPos: AGVector3) {
  const shadowLight = new PointLight(0xffffff, 0, 0);

  shadowLight.position.set(lightPos.x, lightPos.y, lightPos.z);

  shadowLight.castShadow = true;

  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;
  shadowLight.shadow.radius = 3;
  shadowLight.shadow.blurSamples = 25;
  shadowLight.shadow.bias = 0.0001;
  
  return shadowLight;
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