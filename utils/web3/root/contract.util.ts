import { MINT_AMOUNT, NFT_COLLECTION_ID, API, SIGNER } from '../../../constants/root/contract.constant';
import { TransactionBuilder } from '@futureverse/transact';
import { Result } from '../../../types/common.type';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { LogError } from '../../common.util';
import '@therootnetwork/api-types';
import { GetAssetData, GetCollectionDocs, StoreAssetData } from '../../firebase.util';
import { Blockchain } from '../../../enums/blockchain/common.enum';
import { Campaign, CampaignBaseCombination, RootCampaign, SolanaCampaign } from '../../../enums/citizens/common.enum';
import { CitizenMetadata, Drop, RootMetadata } from '../../../interfaces/citizens.interface';
import { MINTING_UI_DATA } from '../../../constants/mint.constant';
import { CampaignDrops } from '../../../types/citizens.type';

export async function GetRootAssetTokenIds(address: string): Promise<Result<number[]>> {
  try {
    const ownedTokens = await API.rpc.nft.ownedTokens(NFT_COLLECTION_ID, address, 0, 1000);

    const jsonResponse = ownedTokens.toJSON();
    const tokenIds = jsonResponse[2];

    return { success: true, value: tokenIds as number[] };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on getting Root Asset');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}

export async function HasSftBalance(address: string, sftDropId: string): Promise<Result<boolean>> {
  try {
    const [sftCollectionId, sftTokenId] = sftDropId.split(':');
    const token = await API.query.sft.tokenInfo([
      sftCollectionId,
      sftTokenId,
    ]);
    const info = token.toHuman() as {
      tokenName: string;
      ownedTokens: [
        string,
        { freeBalance: string; reservedBalance: string },
      ][];
    };

    const firstOwned = info.ownedTokens.find(owned => {
      return (
        owned[0].toLowerCase() === address.toLowerCase()
      );
    });

    const hasBalance = firstOwned ? Number(firstOwned[1].freeBalance) > 0 : false;

    return { success: true, value: hasBalance };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on getting Root Asset');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}

export async function GetRootAssetMetadata(tokenId: string): Promise<Result<CitizenMetadata>> {
  try {
    const assetDataResult = await GetAssetData(Campaign.Based, NFT_COLLECTION_ID as string, tokenId);

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
    const mintBuilder = TransactionBuilder.nft(API, SIGNER, address, Number(NFT_COLLECTION_ID)).mint({ quantity: MINT_AMOUNT, walletAddress: address });
    await mintBuilder.signAndSend();
    const tokenIdsResult = await GetRootAssetTokenIds(address);
    if (tokenIdsResult.success) {
      const tokenIds = tokenIdsResult.value;
      const tokenId = tokenIds[tokenIds.length - 1].toString();
      await StoreAssetData({
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

export async function GetUserFeatureAssets(address: string, campaign: RootCampaign): Promise<Result<CampaignDrops<RootCampaign>>> {
  try {
    const rootDrops: Drop[] = await GetCollectionDocs(`campaign/${campaign}/drops`) as Drop[];

    if (!rootDrops.length) return {
      success: false,
      errMessage: "No drops found",
      errCode: CommonErrorCode.GetNoData
    };

    const dropsCheckPromiseList = rootDrops.map(async (drop) => {
      const dropData = await HasSftBalance(address, drop.contract_address);
      return dropData ? drop : undefined;
    });

    const dropsCheck = await Promise.all(dropsCheckPromiseList);

    const filteredDrops = dropsCheck.filter((dropCheck) => dropCheck !== undefined);

    return {
      success: true,
      value: { [campaign]: filteredDrops }
    };
  } catch (e) {
    const err = e as Error
    void LogError(Module.SolanaContractUtil, "Couldn't get user feature assets", e);
    return {
      success: false,
      errMessage: err.message,
      errCode: CommonErrorCode.InternalError
    }
  }
}
