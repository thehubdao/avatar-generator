import { publicKey } from '@metaplex-foundation/umi';
import { AssetV1, fetchAssetsByOwner } from '@metaplex-foundation/mpl-core';
import { Result } from '../../../types/common.type';
import { LogError } from '../../../utils/common.util';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { UMI, COLLECTION_ID } from '../../../constants/solana/contract.constant';
import { PublicKey } from '@solana/web3.js';
import { CitizenMetadata } from '../../../interfaces/citizens.interface';
import { GetSolanaImageUrl, GetSolanaIPFSData } from '../citizens.util';

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