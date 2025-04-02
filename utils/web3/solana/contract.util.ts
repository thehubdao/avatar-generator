import { publicKey } from '@metaplex-foundation/umi';
import { AssetV1, fetchAssetsByOwner } from '@metaplex-foundation/mpl-core';
import { Result } from '../../../types/common.type';
import { LogError } from '../../../utils/common.util';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { umi, COLLECTION_ID } from '../../../constants/solana/contract.constant';
import { PublicKey } from '@solana/web3.js';

export async function GetAssetsByOwner(walletAddress: string): Promise<Result<AssetV1[]>> {
    try {
        const ownerPublicKey = publicKey(walletAddress);
        const assets = await fetchAssetsByOwner(umi, ownerPublicKey);

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
): Promise<Result<AssetV1>> {
    const assetsResult = await GetAssetsByOwner(walletAddress);
    if (!assetsResult.success) return {
        success: false,
        errMessage: "No assets found",
        errCode: CommonErrorCode.GetNoData
    };

    const collectionAsset = assetsResult.value.find(
        asset => asset.updateAuthority.address === collectionId.toString()
    );

    if (collectionAsset) {
        return {
            success: true,
            value: collectionAsset
        };
    } else return {
        success: false,
        errMessage: "No collection asset found",
        errCode: CommonErrorCode.GetNoData
    };
}