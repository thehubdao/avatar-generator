import { generateSigner, PublicKey, publicKey, signerIdentity, some, transactionBuilder } from '@metaplex-foundation/umi';
import { AssetV1, fetchAssetsByOwner, mplCore } from '@metaplex-foundation/mpl-core';
import { Result } from '../../../types/common.type';
import { LogError } from '../../../utils/common.util';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { UMI, COLLECTION_ID, KUMI_CANDY_MACHINE_ID, KUMI_CANDY_MACHINE_TREASURY } from '../../../constants/solana/contract.constant';
import { CitizenMetadata } from '../../../interfaces/citizens.interface';
import { GetSolanaImageUrl, GetSolanaIPFSData } from '../citizens.util';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { GuardSetMintArgs, mintV1, mplCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';
import {
    fromWeb3JsTransaction,
    toWeb3JsTransaction
} from '@metaplex-foundation/umi-web3js-adapters';
import { CandyMachineGroup } from '../../../enums/citizens/common.enum';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';

export async function InitializeUmi(wallet: ConnectedSolanaWallet) {
    UMI.use(signerIdentity({
        publicKey: publicKey(wallet.address),
        signMessage: async (message: Uint8Array) =>
            await wallet.signMessage(message),
        signTransaction: async (transaction) => {
            const web3JsTransaction = toWeb3JsTransaction(transaction);
            const signedTx = await wallet.signTransaction(web3JsTransaction);
            return fromWeb3JsTransaction(signedTx);
        },
        signAllTransactions: async (transactions) => {
            const web3JsTransactions = transactions.map(toWeb3JsTransaction);
            const signedTxs = await Promise.all(
                web3JsTransactions.map(tx => wallet.signTransaction(tx))
            );
            return signedTxs.map(fromWeb3JsTransaction);
        }
    }));
    UMI.use(mplCore());
    UMI.use(mplCandyMachine());
}

export async function GetAssetsByOwner(walletAddress: string): Promise<Result<AssetV1[]>> {
    try {
        const ownerPublicKey = publicKey(walletAddress);
        const assets = await fetchAssetsByOwner(UMI, ownerPublicKey);

        return {
            success: true,
            value: assets
        };
    } catch (e) {
        const err = e as Error
        void LogError(Module.SolanaContractUtil, err.message, e);
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.FetchError
        };
    }
}

export async function GetCollectionAssetByOwner(
    walletAddress: string,
    collectionId: PublicKey = COLLECTION_ID
): Promise<Result<CitizenMetadata[]>> {
    const assetsResult = await GetAssetsByOwner(walletAddress);
    if (!assetsResult.success) return {
        success: false,
        errMessage: "Couldn't get assets correctly",
        errCode: CommonErrorCode.GetNoData
    };

    const collectionAsset = assetsResult.value.find(
        asset => asset.updateAuthority.address === collectionId.toString()
    );
    if (!collectionAsset) return {
        success: true,
        value: [] //Return empty array because we don't have any collection asset. Means user has to mint
    };

    const cid = collectionAsset.uri.split('//')[1];
    const ipfsDataResult = await GetSolanaIPFSData(cid); // Get the Solana token metadata from IPFS

    if (!ipfsDataResult.success) return {
        success: false,
        errMessage: ipfsDataResult.errMessage,
        errCode: CommonErrorCode.FetchError
    };
    const assetMetadata = ipfsDataResult.value;
    const imageUrlResult = GetSolanaImageUrl(assetMetadata);

    if (!imageUrlResult.success) return {
        success: false,
        errMessage: imageUrlResult.errMessage,
        errCode: CommonErrorCode.FetchError
    };

    assetMetadata.imageUrl = imageUrlResult.value; // take the ipfs data and add the imageUrl and fallbackImageUrl
    assetMetadata.fallbackImageUrl = imageUrlResult.value;
    assetMetadata.tokenId = collectionAsset.key.toString(); //set the tokenId

    return {
        success: true,
        value: [assetMetadata] //Temporarily return as array while we add more campaigns to Solana
    };

}

export async function getKumiCandyMachineGuardGroup(walletAddress: string, collectionId: PublicKey): Promise<Result<{group: CandyMachineGroup, mintArgs: GuardSetMintArgs}>> {
    const assetsResult = await GetCollectionAssetByOwner(walletAddress, collectionId);
    if (!assetsResult.success) return {
        success: false,
        errMessage: assetsResult.errMessage,
        errCode: CommonErrorCode.GetNoData
    };

    if (assetsResult.value.length > 0) return {
        success: true,
        value: {group: CandyMachineGroup.Holder, mintArgs: {solPayment:some({destination:KUMI_CANDY_MACHINE_TREASURY}), assetGate: some({requiredCollection:COLLECTION_ID})}}
    };

    return {
        success: true,
        value: {group: CandyMachineGroup.Public, mintArgs: {solPayment:some({destination:KUMI_CANDY_MACHINE_TREASURY}) }}
    };
}

export async function mintKumiCitizen() : Promise<Result<boolean>> {
    const nftAccount = generateSigner(UMI); //Generate a new NFT account address
    const groupResult = await getKumiCandyMachineGuardGroup(UMI.identity.publicKey, COLLECTION_ID);

    if (!groupResult.success) return {
        success: false,
        errMessage: groupResult.errMessage,
        errCode: CommonErrorCode.GetNoData
    };
console.log(groupResult.value)
    const mintTx = mintV1(UMI, {
        candyMachine: KUMI_CANDY_MACHINE_ID, asset: nftAccount, collection: COLLECTION_ID, group: some(groupResult.value.group), mintArgs: groupResult.value.mintArgs
    });

    await transactionBuilder()
        .add(setComputeUnitLimit(UMI, { units: 300_000 }))
        .add(mintTx)
        .sendAndConfirm(UMI);

    return {
        success: true,
        value: true
    };
}
