import { ApiPromise } from '@polkadot/api';
import { getApiOptions } from "@therootnetwork/api";
import { MINT_AMOUNT, NFT_COLLECTION_ID, PROVIDER } from '../../../constants/root/contract.constant';
import { TransactionBuilder } from '@futureverse/transact';
import { Signer } from '@futureverse/signer';
import { Result } from '../../../types/common.type';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { LogError } from '../../common.util';
import '@therootnetwork/api-types';
import { getAssetData, storeAssetData } from '../../firebase.util';
import { Blockchain } from '../../../enums/blockchain/common.enum';
import { Campaign, CampaignBaseCombination } from '../../../enums/citizens/common.enum';
import { CitizenMetadata, RootMetadata } from '../../../interfaces/citizens.interface';
import { MINTING_UI_DATA } from '../../../constants/mint.constant';

let api: ApiPromise;
let signer: Signer;
let signerEoa: string;


export async function InitializeApi(_signer: Signer, _signerEoa: string) {
  api = await ApiPromise.create({ ...getApiOptions(), provider: PROVIDER });
  signer = _signer;
  signerEoa = _signerEoa;
}

export async function GetRootAssetTokenIds(address: string): Promise<Result<number[]>> {
  try {
    const ownedTokens = await api.rpc.nft.ownedTokens(NFT_COLLECTION_ID, address, 0, 1000);

    const jsonResponse = ownedTokens.toJSON();
    const tokenIds = jsonResponse[2];

    return { success: true, value: tokenIds as number[] };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on getting Root Asset');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}

export async function GetRootAssetMetadata(tokenId: string): Promise<Result<CitizenMetadata>> {
  try {
    const assetDataResult = await getAssetData(Campaign.Based, NFT_COLLECTION_ID as string, tokenId);

    if (!assetDataResult.success) return { success: false, errMessage: assetDataResult.errMessage, errCode: assetDataResult.errCode };

    const assetData = assetDataResult.value;

    const metadata: CitizenMetadata = {
      fallbackImageUrl: assetData.imageUrl,
      imageUrl: assetData.imageUrl,
      combination: assetData.combination,
      baseCombination: assetData.baseCombination,
      campaign: assetData.campaign,
      name: assetData.name,
      description: assetData.description,
      rawMetadata: assetData as RootMetadata,
      tokenId: assetData.tokenId
    };

    return { success: true, value: metadata };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on getting Root Asset Metadata');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}

export async function GetRootAssetsMetadata(address: string): Promise<Result<CitizenMetadata[]>> {
  const tokenIdsResult = await GetRootAssetTokenIds(address);

  if (!tokenIdsResult.success)
    return { success: false, errMessage: tokenIdsResult.errMessage, errCode: tokenIdsResult.errCode };

  const tokenIds = tokenIdsResult.value;
  const metadataPromises = tokenIds.map(async (tokenId) => GetRootAssetMetadata(tokenId.toString()));
  const metadataArray = await Promise.all(metadataPromises);

  const filteredMetadata = metadataArray.filter(metadata => metadata.success);
  const mappedMetadata = filteredMetadata.map(metadata => metadata.value);

  return { success: true, value: mappedMetadata };
}

export async function MintRootAsset(
  address: string,
  baseCombination: CampaignBaseCombination,
  imageUrl: string
): Promise<Result<boolean>> {
  try {
    const mintBuilder = TransactionBuilder.nft(api, signer, address, Number(NFT_COLLECTION_ID)).mint({ quantity: MINT_AMOUNT, walletAddress: address });
    await mintBuilder.signAndSend();
    const tokenIdsResult = await GetRootAssetTokenIds(address);
    if (tokenIdsResult.success) {
      const tokenIds = tokenIdsResult.value;
      const tokenId = tokenIds[tokenIds.length - 1].toString();
      await storeAssetData({
        address,
        tokenId,
        campaign: Campaign.Based,
        collectionId: NFT_COLLECTION_ID as string,
        blockchainType: Blockchain.Root,
        baseCombination,
        combination: baseCombination,
        imageUrl,
        name: MINTING_UI_DATA.root_citizens?.campaignName || '',
        description: MINTING_UI_DATA.root_citizens?.avatarDescription || ''
      });
    } else {
      void LogError(Module.RootContractUtil, 'Could not get Token ID');
      return { success: false, errMessage: tokenIdsResult.errMessage, errCode: tokenIdsResult.errCode };
    }

    return { success: true, value: true };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on minting Root Asset');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}