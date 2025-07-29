import { JsonRpcProvider, Signer } from "ethers";
import { ThrowError } from "../../utils/common.util";

export const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || ThrowError('NEXT_PUBLIC_POLYGON_RPC_URL is required');
export const POLYGON_AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_POLYGON_AVATAR_CONTRACT_ADDRESS || ThrowError('NEXT_PUBLIC_POLYGON_AVATAR_CONTRACT_ADDRESS is required');

export const PROVIDER = new JsonRpcProvider(POLYGON_RPC_URL);

export let SIGNER: Signer;

export async function InitializePolygonContractEssentialData(_signer: Signer): Promise<void> {
  if (_signer) SIGNER = _signer;
}