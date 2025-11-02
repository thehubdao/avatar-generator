import { JsonRpcProvider, Signer, Wallet } from "ethers";
import { ThrowError } from "../../utils/common.util";

export const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || ThrowError('NEXT_PUBLIC_POLYGON_RPC_URL is required');
export const POLYGON_AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_POLYGON_AVATAR_CONTRACT_ADDRESS || ThrowError('NEXT_PUBLIC_POLYGON_AVATAR_CONTRACT_ADDRESS is required');
export const POLYGON_CHAIN_ID = process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID || ThrowError('NEXT_PUBLIC_POLYGON_CHAIN_ID is required');
export const POLYGON_CHAIN_NAME = process.env.NEXT_PUBLIC_POLYGON_CHAIN_NAME || ThrowError('NEXT_PUBLIC_POLYGON_CHAIN_NAME is required');
export const POLYGON_NATIVE_CURRENCY_NAME = process.env.NEXT_PUBLIC_POLYGON_NATIVE_CURRENCY_NAME || ThrowError('NEXT_PUBLIC_POLYGON_NATIVE_CURRENCY_NAME is required');
export const POLYGON_NATIVE_CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_POLYGON_NATIVE_CURRENCY_SYMBOL || ThrowError('NEXT_PUBLIC_POLYGON_NATIVE_CURRENCY_SYMBOL is required');
export const POLYGON_NATIVE_CURRENCY_DECIMALS = process.env.NEXT_PUBLIC_POLYGON_NATIVE_CURRENCY_DECIMALS || ThrowError('NEXT_PUBLIC_POLYGON_NATIVE_CURRENCY_DECIMALS is required');
export const POLYGON_EXPLORER_URL = process.env.NEXT_PUBLIC_POLYGON_EXPLORER_URL || ThrowError('NEXT_PUBLIC_POLYGON_EXPLORER_URL is required');

const POLYGON_WEARABLE_ADMIN_SIGNER_PK = process.env.POLYGON_WEARABLE_ADMIN_PRIVATE_KEY;

export const PROVIDER = new JsonRpcProvider(POLYGON_RPC_URL);

export const WEARABLE_ADMIN_SIGNER = POLYGON_WEARABLE_ADMIN_SIGNER_PK ? new Wallet(POLYGON_WEARABLE_ADMIN_SIGNER_PK).connect(PROVIDER) : undefined;

export let SIGNER: Signer;

export async function InitializePolygonContractEssentialData(_signer: Signer): Promise<void> {
  if (_signer) {
    // La red ya debería estar cambiada antes del login, simplemente asignar el signer
    SIGNER = _signer;
  }
}