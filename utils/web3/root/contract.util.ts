import { MINT_AMOUNT, NFT_COLLECTION_ID, API, SIGNER, ASSET_REGISTER_SDK } from '../../../constants/root/contract.constant';
import { TransactionBuilder } from '@futureverse/transact';
import { Result } from '../../../types/common.type';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { LogError } from '../../common.util';
import '@therootnetwork/api-types';
import { GetAssetData, StoreAssetData } from '../../firebase.util';
import { Blockchain } from '../../../enums/blockchain/common.enum';
import { Campaign, CampaignBaseCombination, RootCampaign } from '../../../enums/citizens/common.enum';
import { CitizenMetadata, RootDrop, RootMetadata } from '../../../interfaces/citizens.interface';
import { MINTING_UI_DATA } from '../../../constants/mint.constant';
import { CampaignDrops } from '../../../types/citizens.type';
import { ARTM, Operation, STATEMENTS } from '@futureverse/artm';
import { RootTransactionStatus } from '../../../enums/web3';
import { CreateAssetLinkOperationMessage, DeleteAssetLinkOperationMessage } from './registry.util';
import { GetCampaignDrops } from '../citizens.util';

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

export async function HasSftBalance(address: string, sftCollectionId: string, sftTokenId: string): Promise<Result<boolean>> {
  try {
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

export async function GetRootUserFeatureAssets(address: string, campaign: RootCampaign): Promise<Result<CampaignDrops<RootCampaign>>> {
  try {
    const rootDrops = await GetCampaignDrops<RootDrop>(campaign);
    if (!rootDrops.success) return rootDrops;

    if (rootDrops.value.length === 0) return {
      success: false,
      errMessage: "No drops found",
      errCode: CommonErrorCode.GetNoData
    };

    const dropsCheckPromiseList = rootDrops.value.map(async (drop) => {
      const dropData = await HasSftBalance(address, drop.collectionId, drop.tokenId);
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

export async function EquipFeaturesOperations(parent_collection_id: string, parent_token_id: string, newAttributes: RootDrop[]): Promise<Result<Operation[]>> {
  const operations: Operation[] = [];

  for (const attribute of newAttributes) {
    const createAssetLinkOperation = CreateAssetLinkOperationMessage(attribute.schemaPart, parent_collection_id, parent_token_id, attribute.collectionId, attribute.tokenId);
    if (!createAssetLinkOperation.success) return { success: false, errMessage: createAssetLinkOperation.errMessage, errCode: createAssetLinkOperation.errCode };
    operations.push(createAssetLinkOperation.value);
  }

  return { success: true, value: operations };
}

export async function UnequipFeaturesOperations(parent_collection_id: string, parent_token_id: string, oldAttributes: RootDrop[]): Promise<Result<Operation[]>> {
  const operations: Operation[] = [];

  for (const attribute of oldAttributes) {
    const deleteAssetLinkOperation = DeleteAssetLinkOperationMessage(attribute.schemaPart, parent_collection_id, parent_token_id, attribute.collectionId, attribute.tokenId);
    if (!deleteAssetLinkOperation.success) return { success: false, errMessage: deleteAssetLinkOperation.errMessage, errCode: deleteAssetLinkOperation.errCode };
    operations.push(deleteAssetLinkOperation.value);
  }

  return { success: true, value: operations };
}

export async function SetRootNewCombination(address: string, parent_tokenId: string, newAttributes: RootDrop[], oldAttributes: RootDrop[]): Promise<Result<boolean>> {
  const equipOperations = await EquipFeaturesOperations(NFT_COLLECTION_ID, parent_tokenId, newAttributes);
  const unequipOperations = await UnequipFeaturesOperations(NFT_COLLECTION_ID, parent_tokenId, oldAttributes);

  if (!equipOperations.success || !unequipOperations.success) return { success: false, errMessage: 'Error on setting new combination. All operations must be successful', errCode: CommonErrorCode.InternalError };

  const allOperations = [...unequipOperations.value, ...equipOperations.value];
  const [nonce] = await ASSET_REGISTER_SDK.nonceForChainAddress(address as `0x${string}`).execute();
  const artm = new ARTM({ address, statement: STATEMENTS.ASSET_UPDATE, operations: allOperations, nonce });
  const signature = await SIGNER.signMessage(artm.message);

  const input = {
    signature,
    transaction: artm.message,
  };
  const response = await ASSET_REGISTER_SDK.submitTransaction(input).execute();

  const [{ transactionHash }] = await ASSET_REGISTER_SDK.transaction({
    transactionHash: response[0],
  }).execute();

  let [{ status }]: { status: RootTransactionStatus }[] = await ASSET_REGISTER_SDK.transaction({ transactionHash }).execute();
  while (status === RootTransactionStatus.PENDING) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    [{ status }] = await ASSET_REGISTER_SDK.transaction({ transactionHash }).execute();
  }

  if (status === RootTransactionStatus.SUCCESS) {
    return { success: true, value: true };
  }

  return { success: false, errMessage: 'Transaction failed', errCode: CommonErrorCode.InternalError };
}

