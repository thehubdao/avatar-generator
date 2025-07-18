import { JsonRpcProvider, Signer } from "ethers";
import { throwError } from "../../utils/common.util";

export const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || throwError('NEXT_PUBLIC_POLYGON_RPC_URL is required');
export const POLYGON_AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_POLYGON_AVATAR_CONTRACT_ADDRESS || throwError('NEXT_PUBLIC_POLYGON_AVATAR_CONTRACT_ADDRESS is required');

export const PROVIDER = new JsonRpcProvider(POLYGON_RPC_URL);

export let SIGNER: Signer;

export async function InitializePolygonContractEssentialData(_signer: Signer): Promise<void> {
  if (_signer) SIGNER = _signer;
}