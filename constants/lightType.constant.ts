import { LightType } from "../enums/light.enum";

export const LIGHT_TYPE_LABELS: Record<LightType, string> = {
  [LightType.PointLight]: 'Point Light',
  [LightType.AmbientLight]: 'Ambient Light',
  [LightType.RectAreaLight]: 'Rect Area Light',
};

export const LIGHT_PROPERTIES = {
  [LightType.PointLight]: ['position', 'lookAt', 'color', 'intensity', 'distance', 'decay'],
  [LightType.RectAreaLight]: ['position', 'lookAt', 'color', 'intensity', 'size'],
  [LightType.AmbientLight]: ['color', 'intensity'],
  ['']: []
}

export const INDEX_OUT_LIGHT_ARRAY = {
  create_light: -2,
  no_lights: -1
}