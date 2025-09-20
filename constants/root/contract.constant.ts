import { ApiPromise, WsProvider } from '@polkadot/api';
import { getApiOptions } from '@therootnetwork/api';
import { LogError, ThrowError } from '../../utils/common.util';
import { Module } from '../../enums/common.enum';
import { Signer } from '@futureverse/signer';
import { AssetRegister } from '@futureverse/asset-register/v2';
import { KeyringPair } from '@polkadot/keyring/types';
import { UserSession } from '@futureverse/auth-react/auth';

export const ROOT_NETWORK_WS_URL = process.env.NEXT_PUBLIC_ROOT_NETWORK_WS_URL as string;

export const PROVIDER = new WsProvider(ROOT_NETWORK_WS_URL);

export const MINT_AMOUNT = 1;

export const NFT_COLLECTION_ID = process.env.NEXT_PUBLIC_ROOT_NFT_COLLECTION_ID || ThrowError('NEXT_PUBLIC_ROOT_NFT_COLLECTION_ID is required');

export const ROOT_GQL_API_URL = process.env.NEXT_PUBLIC_ROOT_GQL_API_URL || ThrowError('NEXT_PUBLIC_ROOT_GQL_API_URL is required');
export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || ThrowError('NEXT_PUBLIC_DOMAIN is required');
export const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || ThrowError('NEXT_PUBLIC_ORIGIN is required');
export const ROOT_CHAIN_ID = process.env.NEXT_PUBLIC_ROOT_CHAIN_ID || ThrowError('NEXT_PUBLIC_ROOT_CHAIN_ID is required');
export const ROOT_CHAIN_NAME = process.env.NEXT_PUBLIC_ROOT_CHAIN_NAME || ThrowError('NEXT_PUBLIC_ROOT_CHAIN_NAME is required');
export const ROOT_NATIVE_CURRENCY_NAME = process.env.NEXT_PUBLIC_ROOT_NATIVE_CURRENCY_NAME || ThrowError('NEXT_PUBLIC_ROOT_NATIVE_CURRENCY_NAME is required');
export const ROOT_NATIVE_CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_ROOT_NATIVE_CURRENCY_SYMBOL || ThrowError('NEXT_PUBLIC_ROOT_NATIVE_CURRENCY_SYMBOL is required');
export const ROOT_NATIVE_CURRENCY_DECIMALS = process.env.NEXT_PUBLIC_ROOT_NATIVE_CURRENCY_DECIMALS || ThrowError('NEXT_PUBLIC_ROOT_NATIVE_CURRENCY_DECIMALS is required');
export const ROOT_RPC_URL = process.env.NEXT_PUBLIC_ROOT_RPC_URL || ThrowError('NEXT_PUBLIC_ROOT_RPC_URL is required');
export const ROOT_EXPLORER_URL = process.env.NEXT_PUBLIC_ROOT_EXPLORER_URL || ThrowError('NEXT_PUBLIC_ROOT_EXPLORER_URL is required');


export const ROOT_SIGNER_PK = process.env.ROOT_SIGNER_PK || '';

export const BASE_ETH_NUMBER = 10;
export const BASE_DECIMALS_NUMBER = 18;

export const ROOT_TOKEN_ID = 1;

export let ASSET_REGISTER_SDK: AssetRegister;

export let API: ApiPromise;
export let SIGNER: Signer;
export let SESSION: UserSession;
export let KEYRING_SIGNER: KeyringPair;
export let isINIT: boolean;

export async function InitializeContractEssentialData(_signer?: Signer, _keyringSigner?: KeyringPair, userSession?: UserSession) {
  if (API) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Api already initialized');
  API = await ApiPromise.create({ ...getApiOptions(), provider: PROVIDER });
  if (KEYRING_SIGNER) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Keyring Signer already initialized');
  if (_keyringSigner) KEYRING_SIGNER = _keyringSigner;

  if (SESSION) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Session already initialized');
  if (userSession) SESSION = userSession;

  if (SIGNER) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Signer already initialized');
  if (_signer) {
    // La red ya debería estar cambiada antes del login, simplemente asignar el signer
    SIGNER = _signer;
  }

  if (ASSET_REGISTER_SDK) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Asset Register SDK already initialized');

  if (SIGNER) ASSET_REGISTER_SDK = new AssetRegister({
    url: ROOT_GQL_API_URL,
    auth: {
      sign: async (message) => {
        return await SIGNER.signMessage({ raw: message as `0x${string}` });
      },
      storage: {
        set: (key: string, value: string) => localStorage.setItem(key, value),
        get: (key: string) => localStorage.getItem(key),
      },
      domain: DOMAIN,
      origin: ORIGIN,
      chainId: Number(ROOT_CHAIN_ID),
      walletAddress: (await SIGNER.getAddress()) as `0x${string}`,
    },
  });

  isINIT = true;
}