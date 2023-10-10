export interface ConfigSkybox {
  scale: number;
  radius: number;
  height: number;
}

export interface ConfigEnvMap {
  defBgMap?: string;
  defLightMap?: string;
  skyboxConfig?: ConfigSkybox;
}