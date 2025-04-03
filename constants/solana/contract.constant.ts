import { PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

export const COLLECTION_ID = new PublicKey('GbwhRDb6Xwe1ZMG6Ei6ttPpCqe3JKuv7a1zViuxz9RR');
export const UMI = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '');