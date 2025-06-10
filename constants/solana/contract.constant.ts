import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { createSignerFromKeypair, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

export const KUMI_CANDY_MACHINE_ID = publicKey(process.env.NEXT_PUBLIC_KUMI_CANDY_MACHINE_ID || '');
export const COLLECTION_ID = publicKey(process.env.NEXT_PUBLIC_COLLECTION_ID || '');
export const COLLECTION_GUARD_ID = publicKey(process.env.NEXT_PUBLIC_GUARD_COLLECTION_ID || '');
export const KUMI_CANDY_MACHINE_TREASURY = publicKey(process.env.NEXT_PUBLIC_KUMI_CANDY_MACHINE_TREASURY || '');
export const UMI = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '', {
    commitment: 'finalized'
});
export const ADMIN_WALLET_SECRET_KEY = bs58.decode(process.env.KUMI_ADMIN_WALLET_SECRET_KEY || '');
export const ADMIN_WALLET_KEYPAIR = UMI.eddsa.createKeypairFromSecretKey(new Uint8Array(ADMIN_WALLET_SECRET_KEY));
export const ADMIN_SIGNER = createSignerFromKeypair(UMI, ADMIN_WALLET_KEYPAIR);
