export const GLOBAL_VALUES = {
  BaseCampaign: "lukso",
  Acc: "Accessories",
  Config: "Config",
  AccEnd: "Acc",
  AccGroup: "Accessories.AG",
  AvatarBase: "base_mesh/MetaAvatarHub.glb",
  CollectorIndexSeparator: "-",
  StageId: "stage",
} as const;

export const EXPORT_ATTRIBUTE = {
  Campaign: "campaign",
} as const;

export const IFRAME_VALUES = {
  Project: "avatar-generator",
  Event: "message",
} as const;

export const LUKSO_BACKEND_URL = process.env.NEXT_PUBLIC_LUKSO_BACKEND_URL
export const VRM_PROCESS_SERVICE_URL = process.env.NEXT_PUBLIC_VRM_PROCESS_SERVICE_URL || ""
export const AVATAR_MAX_SUPPLY = 1764