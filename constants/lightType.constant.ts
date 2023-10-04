import { LightType } from "../enums/light.enum";

export const LIGHT_TYPE_LABELS: Record<LightType, string> = {
  [LightType.PointLight]: 'Point Light',
  [LightType.AmbientLight]: 'Ambient Light',
  [LightType.RectAreaLight]: 'Rect Area Light',
};