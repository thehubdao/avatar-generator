import { AmbientLight, Light, PointLight, RectAreaLight } from "three";
import { ConfigLight } from "../../interfaces/light.interface";
import { LightType } from "../../enums/light.enum";
import { ColorStringToHexString } from "../common.util";
import { AGVector3 } from "../../interfaces/common.interface";

type GenerateLightFunction = (light: ConfigLight) => Light;

function DefaultLights(): Light[] {
  const ambient = new AmbientLight( 0x404040 );

  const pointOne = new PointLight( 0xffffff, 1, 0 );
  pointOne.position.set(1, 1, 10);
  
  return [ambient, pointOne];
}

export function GetLights(toDoLights: ConfigLight[] | undefined) {
  if (toDoLights == undefined) return DefaultLights();

  const newLights: Light[] = [];
  for (const light of toDoLights) {
    const generatedLight = GenerateLight(light);
    if (generatedLight != undefined)
      newLights.push(generatedLight);
  }

  return newLights;
}

function GetGenerateLightFunction(type: LightType): GenerateLightFunction | undefined {
  switch (type) {
    case LightType.PointLight:
      return GeneratePointLight;
    case LightType.AmbientLight:
      return GenerateAmbientLight;
    case LightType.RectAreaLight:
      return GenerateRectAreaLight;
    default:
      return undefined;
  }
}

function GenerateLight(light: ConfigLight) {
  const generateLightFunction = GetGenerateLightFunction(light.type);
  if (generateLightFunction == undefined) return undefined;

  return generateLightFunction(light);
}

function GeneratePointLight(light: ConfigLight) {
  const {
    color,
    intst,
    dist,
    decay,
    pos,
  } = light.params;

  const newLight = new PointLight(ColorStringToHexString(color), intst, dist, decay);
  if (pos != undefined)
    newLight.position.set(pos.x, pos.y, pos.z);

  return newLight;
}

function GenerateAmbientLight(light: ConfigLight) {
  const {
    color,
    intst,
  } = light.params;

  const newLight = new AmbientLight(ColorStringToHexString(color), intst);
  return newLight;
}

function GenerateRectAreaLight(light: ConfigLight) {
  const {
    color,
    intst,
    width,
    height,
    pos,
    lAt,
  } = light.params;

  const newLight = new RectAreaLight(ColorStringToHexString(color), intst, width, height);
  if (pos != undefined) newLight.position.set(pos.x, pos.y, pos.z);
  if (lAt != undefined) newLight.lookAt(lAt.x, lAt.y, lAt.z);

  return newLight;
}

export function GenerateShadowLight(lightPos: AGVector3) {
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