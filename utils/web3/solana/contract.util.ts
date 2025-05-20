import { generateSigner, PublicKey, publicKey, signerIdentity, some, transactionBuilder } from '@metaplex-foundation/umi';
import { AssetV1, fetchAssetsByOwner, fetchCollection, mplCore } from '@metaplex-foundation/mpl-core';
import { Result } from '../../../types/common.type';
import { LogError } from '../../../utils/common.util';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { UMI, COLLECTION_ID, KUMI_CANDY_MACHINE_ID, KUMI_CANDY_MACHINE_TREASURY, COLLECTION_GUARD_ID } from '../../../constants/solana/contract.constant';
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
): Promise<Result<AssetV1 | undefined>> {
    const assetsResult = await GetAssetsByOwner(walletAddress);
    if (!assetsResult.success) return {
        success: false,
        errMessage: "Couldn't get assets correctly",
        errCode: CommonErrorCode.GetNoData
    };

    const collectionAsset = assetsResult.value.find(
        asset => asset.updateAuthority.address === collectionId.toString()
    );

    return {
        success: true,
        value: collectionAsset
    };

}

export async function GetSolanaCitizenMetadata(collectionAsset: AssetV1): Promise<Result<CitizenMetadata>> {
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
        value: assetMetadata
    };
}

export async function GetCampaignCitizensMetadata(walletAddress: string): Promise<Result<CitizenMetadata[]>> { //This function will change when we add more campaigns to Solana to handle multiple collectionIds
    const assetsResult = await GetCollectionAssetByOwner(walletAddress, COLLECTION_ID);
    console.log(assetsResult, COLLECTION_ID);
    if (!assetsResult.success) return {
        success: false,
        errMessage: assetsResult.errMessage,
        errCode: CommonErrorCode.GetNoData
    };

    if (!assetsResult.value) return {
        success: true,
        value: [] //Return empty array because we don't have any collection asset. Means user has to mint
    };

    const citizenMetadataResult = await GetSolanaCitizenMetadata(assetsResult.value);

    if (!citizenMetadataResult.success) return {
        success: false,
        errMessage: "Couldn't get citizens metadata correctly",
        errCode: CommonErrorCode.GetNoData
    };

    return {
        success: true,
        value: [citizenMetadataResult.value]
    };

}

export async function GetKumiCandyMachineGuardGroup(walletAddress: string, collectionGuardId: PublicKey): Promise<Result<{ group: CandyMachineGroup, mintArgs: GuardSetMintArgs }>> {
    const assetsResult = await GetCollectionAssetByOwner(walletAddress, collectionGuardId);
    if (!assetsResult.success) return {
        success: false,
        errMessage: assetsResult.errMessage,
        errCode: CommonErrorCode.GetNoData
    };
    console.log(assetsResult.value, collectionGuardId);
    if (assetsResult.value) return {
        success: true,
        value: { group: CandyMachineGroup.Holder, mintArgs: { solPayment: some({ destination: KUMI_CANDY_MACHINE_TREASURY }), assetGate: some({ asset: assetsResult.value.publicKey }) } }
    };

    return {
        success: true,
        value: { group: CandyMachineGroup.Public, mintArgs: { solPayment: some({ destination: KUMI_CANDY_MACHINE_TREASURY }) } }
    };
}

export async function GetMintingPrice(walletAddress: string): Promise<Result<number>> {
    const mintingPrice = await GetKumiCandyMachineGuardGroup(walletAddress, COLLECTION_GUARD_ID);
    if (!mintingPrice.success) return {
        success: false,
        errMessage: mintingPrice.errMessage,
        errCode: CommonErrorCode.GetNoData
    };

    if (mintingPrice.value.group === CandyMachineGroup.Holder) return {
        success: true,
        value: 0.0042
    };
    if (mintingPrice.value.group === CandyMachineGroup.Public) return {
        success: true,
        value: 0.2
    };

    return {
        success: false,
        errMessage: "Couldn't get minting price correctly",
        errCode: CommonErrorCode.GetNoData
    };

}

export async function MintKumiCitizen(): Promise<Result<boolean>> {
    const nftAccount = generateSigner(UMI); //Generate a new NFT account address
    const groupResult = await GetKumiCandyMachineGuardGroup(UMI.identity.publicKey, COLLECTION_GUARD_ID);

    if (!groupResult.success) return {
        success: false,
        errMessage: groupResult.errMessage,
        errCode: CommonErrorCode.GetNoData
    };
    console.log(groupResult.value);
    const mintTx = mintV1(UMI, {
        candyMachine: KUMI_CANDY_MACHINE_ID, asset: nftAccount, collection: COLLECTION_ID, group: some(groupResult.value.group), mintArgs: groupResult.value.mintArgs,
    });

    await transactionBuilder()
        .add(setComputeUnitLimit(UMI, { units: 600_000 }))
        .add(mintTx)
        .sendAndConfirm(UMI, { send: { commitment: 'finalized' } });

    return {
        success: true,
        value: true
    };
}

export async function GetCollectionSupply(collectionId: PublicKey = COLLECTION_ID): Promise<Result<number>> {
    try {
        const collection = await fetchCollection(UMI, collectionId.toString());
        return {
            success: true,
            value: collection.numMinted
        };
    } catch (e) {
        const err = e as Error
        void LogError(Module.SolanaContractUtil, "Couldn't get collection supply", e);
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.GetNoData
        };
    }
}
