import { ApiPromise, WsProvider } from '@polkadot/api';
import { getApiOptions } from '@therootnetwork/api';
import { LogError } from '../../utils/common.util';
import { Module } from '../../enums/common.enum';
import { Signer } from '@futureverse/signer';
import { AssetRegister } from '@futureverse/asset-register/v2'

const ROOT_NETWORK_WS_URL = process.env.NEXT_PUBLIC_ROOT_NETWORK_WS_URL;

export const PROVIDER = new WsProvider(ROOT_NETWORK_WS_URL);

export const MINT_AMOUNT = 1;

export const NFT_COLLECTION_ID = process.env.NEXT_PUBLIC_NFT_COLLECTION_ID as string;
export const NFT_COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS as string;

export const ROOT_GQL_API_URL = process.env.NEXT_PUBLIC_ROOT_GQL_API_URL as string;
export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN as string;
export const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN as string;
export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID as string;

export let ASSET_REGISTER_SDK: AssetRegister;

export let API: ApiPromise;
export let SIGNER: Signer;


export async function InitializeContractEssentialData(_signer: Signer) {

    if (API) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Api already initialized');
    API = await ApiPromise.create({ ...getApiOptions(), provider: PROVIDER });

    if (SIGNER) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Signer already initialized');
    SIGNER = _signer;

    if (ASSET_REGISTER_SDK) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Asset Register SDK already initialized');
    ASSET_REGISTER_SDK = new AssetRegister({
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
          chainId: Number(CHAIN_ID),
          walletAddress: await SIGNER.getAddress() as `0x${string}`,
        },
      });
}