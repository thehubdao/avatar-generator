import { Keyring, WsProvider } from '@polkadot/api';
import { Signer } from '@futureverse/signer';
import { hexToU8a } from '@polkadot/util';

const ROOT_NETWORK_WS_URL = process.env.NEXT_PUBLIC_ROOT_NETWORK_WS_URL;

export const PROVIDER = new WsProvider(ROOT_NETWORK_WS_URL);

const KEYRING = new Keyring({ type: "ethereum" });
const SEED_U8A = hexToU8a(process.env.NEXT_PUBLIC_SIGNER_PK);

export const ADMIN_SIGNER = KEYRING.addFromSeed(SEED_U8A);

export const MINT_AMOUNT = 1;

export const NFT_COLLECTION_ID = Number(process.env.NEXT_PUBLIC_NFT_COLLECTION_ID);
export const NFT_COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
