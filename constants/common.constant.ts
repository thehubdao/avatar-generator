import { Campaign } from "../enums/citizens/common.enum";
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