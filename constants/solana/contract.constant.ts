import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { mplCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { createSignerFromKeypair, KeypairSigner, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { ThrowError } from "../../utils/common.util";

export const KUMI_CANDY_MACHINE_ID = publicKey(process.env.NEXT_PUBLIC_KUMI_CANDY_MACHINE_ID || ThrowError('NEXT_PUBLIC_KUMI_CANDY_MACHINE_ID is required'));
export const COLLECTION_ID = publicKey(process.env.NEXT_PUBLIC_COLLECTION_ID || ThrowError('NEXT_PUBLIC_COLLECTION_ID is required'));
export const COLLECTION_GUARD_ID = publicKey(process.env.NEXT_PUBLIC_GUARD_COLLECTION_ID || ThrowError('NEXT_PUBLIC_GUARD_COLLECTION_ID is required'));
export const KUMI_CANDY_MACHINE_TREASURY = publicKey(process.env.NEXT_PUBLIC_KUMI_CANDY_MACHINE_TREASURY || ThrowError('NEXT_PUBLIC_KUMI_CANDY_MACHINE_TREASURY is required'));
export const UMI = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || ThrowError('NEXT_PUBLIC_SOLANA_RPC_URL is required'), {
    commitment: 'finalized'
});

export let ADMIN_SIGNER: KeypairSigner;

export async function InitializeServerAdminData() {
    const adminWalletSecretKey = bs58.decode(process.env.KUMI_ADMIN_WALLET_SECRET_KEY || ThrowError('KUMI_ADMIN_WALLET_SECRET_KEY is required'));
    const adminWalletKeypair = UMI.eddsa.createKeypairFromSecretKey(new Uint8Array(adminWalletSecretKey));
    ADMIN_SIGNER = createSignerFromKeypair(UMI, adminWalletKeypair);
    UMI.use(signerIdentity(ADMIN_SIGNER));
    UMI.use(mplCore());
    UMI.use(mplCandyMachine());
}