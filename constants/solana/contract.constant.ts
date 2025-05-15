import { PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";

export const KUMI_CANDY_MACHINE_ID = publicKey(process.env.NEXT_PUBLIC_KUMI_CANDY_MACHINE_ID || '');
export const COLLECTION_ID = publicKey(process.env.NEXT_PUBLIC_COLLECTION_ID || '');
export const KUMI_CANDY_MACHINE_TREASURY = publicKey(process.env.NEXT_PUBLIC_KUMI_CANDY_MACHINE_TREASURY || '');
export const UMI = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '');