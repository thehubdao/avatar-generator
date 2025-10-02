import { Campaign } from "../types/citizens.type";
import { POLYGON_CHAIN_ID, POLYGON_CHAIN_NAME, POLYGON_NATIVE_CURRENCY_NAME, POLYGON_NATIVE_CURRENCY_SYMBOL, POLYGON_NATIVE_CURRENCY_DECIMALS, POLYGON_RPC_URL, POLYGON_EXPLORER_URL } from "./polygon/contract.constant";
import { ROOT_CHAIN_ID, ROOT_CHAIN_NAME, ROOT_NATIVE_CURRENCY_NAME, ROOT_NATIVE_CURRENCY_SYMBOL, ROOT_NATIVE_CURRENCY_DECIMALS, ROOT_RPC_URL, ROOT_EXPLORER_URL } from "./root/contract.constant";

export const GLOBAL_VALUES = {
  BaseCampaign: "citizens",
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

export const VRM_PROCESS_SERVICE_URL = process.env.NEXT_PUBLIC_VRM_PROCESS_SERVICE_URL || "";
export const AVATAR_MAX_SUPPLY = 1764;

export const NETWORK_CONFIGS = {
  [Campaign.Polygon]: {
    expectedChainId: Number(POLYGON_CHAIN_ID),
    config: {
      chainId: `0x${Number(POLYGON_CHAIN_ID).toString(16)}`,
      chainName: POLYGON_CHAIN_NAME,
      nativeCurrency: {
        name: POLYGON_NATIVE_CURRENCY_NAME,
        symbol: POLYGON_NATIVE_CURRENCY_SYMBOL,
        decimals: Number(POLYGON_NATIVE_CURRENCY_DECIMALS)
      },
      rpcUrls: [POLYGON_RPC_URL],
      blockExplorerUrls: [POLYGON_EXPLORER_URL]
    }
  },
  [Campaign.Based]: {
    expectedChainId: Number(ROOT_CHAIN_ID),
    config: {
      chainId: `0x${Number(ROOT_CHAIN_ID).toString(16)}`,
      chainName: ROOT_CHAIN_NAME,
      nativeCurrency: {
        name: ROOT_NATIVE_CURRENCY_NAME,
        symbol: ROOT_NATIVE_CURRENCY_SYMBOL,
        decimals: Number(ROOT_NATIVE_CURRENCY_DECIMALS)
      },
      rpcUrls: [ROOT_RPC_URL],
      blockExplorerUrls: [ROOT_EXPLORER_URL]
    }
  }
};

// Configuraciones de cámara para captura de fotos por campaña
export const PHOTO_CAMERA_CONFIGS = {
  [Campaign.Citizens]: {
    position: { x: 0, y: 1.6, z: 1 },
    target: { x: 0, y: 1.4, z: 0 },
    imageSize: 1024,
    fov: 50,
    aspect: 1.0
  },
  [Campaign.Creators]: {
    position: { x: 0, y: 1.6, z: 1 },
    target: { x: 0, y: 1.4, z: 0 },
    imageSize: 1024,
    fov: 50,
    aspect: 1.0
  },
  [Campaign.Polygon]: {
    position: { x: 0, y: 1.6, z: 0.95 },
    target: { x: 0, y: 1.4, z: 0 },
    imageSize: 1024,
    fov: 50,
    aspect: 1.0
  },
  [Campaign.Based]: {
    position: { x: 0, y: 1, z: 1.2 },
    target: { x: 0, y: 0.88, z: 0 },
    imageSize: 1024,
    fov: 50,
    aspect: 1.0
  },
  [Campaign.Kumi]: {
    position: { x: 0, y: 0.5, z: 1.3 },
    target: { x: 0, y: 1, z: 0 },
    imageSize: 1024,
    fov: 50,
    aspect: 1.0
  }
};