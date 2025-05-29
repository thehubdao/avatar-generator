import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { hexToU8a } from '@polkadot/util';
import { getApiOptions } from '@therootnetwork/api';
import { LogError } from '../../utils/common.util';
import { Module } from '../../enums/common.enum';
import { Signer } from '@futureverse/signer';

const ROOT_NETWORK_WS_URL = process.env.NEXT_PUBLIC_ROOT_NETWORK_WS_URL;

export const PROVIDER = new WsProvider(ROOT_NETWORK_WS_URL);

const KEYRING = new Keyring({ type: "ethereum" });
const SEED_U8A = hexToU8a(process.env.NEXT_PUBLIC_SIGNER_PK);

export const ADMIN_SIGNER = KEYRING.addFromSeed(SEED_U8A);

export const MINT_AMOUNT = 1;

export const NFT_COLLECTION_ID = process.env.NEXT_PUBLIC_NFT_COLLECTION_ID;
export const NFT_COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;

export let API: ApiPromise;
export let SIGNER: Signer;


export async function InitializeContractEssentialData(_signer: Signer) {

    if (API) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Api already initialized');
    API = await ApiPromise.create({ ...getApiOptions(), provider: PROVIDER });

    if (SIGNER) return LogError(Module.RootContractConstant, 'Attempted to initialize in Singleton Pattern. Signer already initialized');
    SIGNER = _signer;
}