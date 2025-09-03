import { MINT_AMOUNT, NFT_COLLECTION_ID, API, SIGNER, ASSET_REGISTER_SDK, ROOT_SIGNER_PK, KEYRING_SIGNER, BASE_ETH_NUMBER, ROOT_TOKEN_ID, SESSION } from '../../../constants/root/contract.constant';
import { TransactionBuilder } from '@futureverse/transact';
import { Result } from '../../../types/common.type';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { LogError } from '../../common.util';
import '@therootnetwork/api-types';
import { GetAssetData, StoreAssetData } from '../../firebase.util';
import { Blockchain } from '../../../enums/blockchain/common.enum';
import { Campaign, CampaignBaseCombination, RootCampaign } from '../../../enums/citizens/common.enum';
import { CitizenMetadata, LinkableToken, MintingPriceData, RootDrop, RootMetadata } from '../../../interfaces/citizens.interface';
import { MINTING_UI_DATA } from '../../../constants/mint.constant';
import { CampaignDrops } from '../../../types/citizens.type';
import { ARTM, Operation, STATEMENTS } from '@futureverse/artm';
import { RootTransactionStatus } from '../../../enums/web3';
import { CreateAssetLinkOperationMessage, DeleteAssetLinkOperationMessage, GetLinkableTokenId, GetSFTAssetLinks } from './registry.util';
import { GetCampaignDrops } from '../citizens.util';
import { Keyring } from '@polkadot/api';
import { hexToU8a } from '@polkadot/util';
import { KeyringPair } from '@polkadot/keyring/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { AssetRegistryAction, RootErrorCode } from '../../../enums/root/common.enum';

export function GetAdminSigner(): KeyringPair {
  const keyring = new Keyring({ type: "ethereum" });
  const seedU8a = hexToU8a(ROOT_SIGNER_PK);
  const adminSigner = keyring.addFromSeed(seedU8a);
  return adminSigner;
}

export async function GetRootAssetTokenIds(address: string, collectionId: string): Promise<Result<number[]>> {
  try {
    const ownedTokens = await API.rpc.nft.ownedTokens(collectionId, address, 0, 1000);
    const jsonResponse = ownedTokens.toJSON();
    const tokenIds = jsonResponse[2];

    return { success: true, value: tokenIds as number[] };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on getting Root Asset');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}

export async function SftBalance(address: string, sftCollectionId: string, sftTokenId: string): Promise<Result<number>> {
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
      const owner = owned[0].toLowerCase();
      return (
        owner === address.toLowerCase()
      );
    });

    const balance = firstOwned ? Number(firstOwned[1].freeBalance) : 0;

    return { success: true, value: balance };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on getting Root Asset');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}

export async function GetLinkableTokenIds(address: string, collectionId: string): Promise<Result<LinkableToken[]>> {
  try {
    const tokenIdsResult = await GetRootAssetTokenIds(address, collectionId);

    if (!tokenIdsResult.success) return { success: false, errMessage: tokenIdsResult.errMessage, errCode: tokenIdsResult.errCode };

    const tokenIds = tokenIdsResult.value;
    const linkableTokenIdsPromises = tokenIds.map(async (tokenId) => {
      {
        const isLinkableResult = await GetLinkableTokenId(collectionId, tokenId.toString());

        if (!isLinkableResult.success) return null;
        if (!isLinkableResult.value) return null;

        return isLinkableResult.value;
      }
    });
    const linkableTokenIdsResults = await Promise.all(linkableTokenIdsPromises);
    const linkableTokenIds = linkableTokenIdsResults.filter(linkable => linkable !== null);

    return { success: true, value: linkableTokenIds };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on getting linkable token ids');
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
  const tokenIdsResult = await GetRootAssetTokenIds(address, NFT_COLLECTION_ID);
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
    const mintBuilder = TransactionBuilder.nft(API, SIGNER, SESSION.eoa, Number(NFT_COLLECTION_ID)).mint({ quantity: MINT_AMOUNT, walletAddress: address });

    await mintBuilder.addFuturePass(SESSION.futurepass);

    await mintBuilder.addFuturePassAndFeeProxy({
      futurePass: SESSION.futurepass,
      assetId: ROOT_TOKEN_ID,
      slippage: 5,
    });


    const mintBigIntFees = await mintBuilder.getGasFees();
    const mintIntFees = Number(mintBigIntFees.gasFee) / Math.pow(BASE_ETH_NUMBER, mintBigIntFees.tokenDecimals);
    const { balance: walletBigIntBalance } = await mintBuilder.checkBalance({ walletAddress: SESSION.futurepass, assetId: ROOT_TOKEN_ID });
    const walletIntBalance = Number(walletBigIntBalance) / Math.pow(BASE_ETH_NUMBER, mintBigIntFees.tokenDecimals);

    const mintDetails = (await API.query.nft.publicMintInfo(NFT_COLLECTION_ID)).toHuman() as { enabled: boolean, pricingDetails: Array<string> };

    const mintPrice = Number(mintDetails?.pricingDetails[1].split(',').join('')) / Math.pow(BASE_ETH_NUMBER, mintBigIntFees.tokenDecimals);

    if (!mintDetails?.enabled) { return { success: false, errMessage: "Minting is not enabled", errCode: CommonErrorCode.InternalError }; }
    console.log(walletIntBalance, mintIntFees, mintPrice, walletBigIntBalance);
    if (walletIntBalance < mintIntFees + mintPrice) {
      return { success: false, errMessage: " " + Number(mintIntFees + mintPrice) + " ROOT are required in wallet balance to mint this asset", errCode: RootErrorCode.InsufficientFunds };
    }

    await mintBuilder.signAndSend();
    const tokenIdsResult = await GetRootAssetTokenIds(address, NFT_COLLECTION_ID);
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
        description: MINTING_UI_DATA.root_citizens?.avatarDescription || '',
        attributes: []
      });
    } else {
      void LogError(Module.RootContractUtil, 'Could not get Token ID');
      return { success: false, errMessage: tokenIdsResult.errMessage, errCode: tokenIdsResult.errCode };
    }

    return { success: true, value: true };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on minting Root Asset', e.message);
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}

export async function GetRootCollectionSupply(): Promise<Result<number>> {
  try {
    const collection = await API.query.nft.collectionInfo(NFT_COLLECTION_ID);
    const { collectionIssuance } = collection.toHuman() as { collectionIssuance: number };

    return {
      success: true,
      value: collectionIssuance
    };
  } catch (e) {
    const err = e as Error;
    void LogError(Module.SolanaContractUtil, "Couldn't get collection supply", e);
    return {
      success: false,
      errMessage: err.message,
      errCode: CommonErrorCode.GetNoData
    };
  }
}

export async function GetRootMintingPrice(): Promise<Result<MintingPriceData>> {
  return { success: true, value: { mintPrice: 123, mintingPriceSymbol: 'ROOT' } };
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
      const [collectionId, tokenId] = drop.collectionId.split(':');
      const balance = await SftBalance(address, collectionId, tokenId);
      const linkableTokenIdsResult = await GetSFTAssetLinks(collectionId, tokenId, address); //Get the linkable token ids for the drop

      if (!linkableTokenIdsResult.success || !balance.success) return null;

      if (linkableTokenIdsResult.value.length === balance.value) return null;

      drop.balance = balance.value - linkableTokenIdsResult.value.length;
      drop.linkableTokens = linkableTokenIdsResult.value;

      return drop;
    });

    const dropsCheck = await Promise.all(dropsCheckPromiseList);
    const filteredDrops = dropsCheck.filter((dropCheck) => dropCheck !== null); //Filter out the drops that are linkable

    return {
      success: true,
      value: { [campaign]: filteredDrops }
    };
  } catch (e) {
    const err = e as Error;
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
    const [collectionId, tokenId] = attribute.collectionId.split(':');
    const createAssetLinkOperation = CreateAssetLinkOperationMessage(attribute.schemaPart, parent_collection_id, parent_token_id, collectionId, tokenId);
    if (!createAssetLinkOperation.success) return { success: false, errMessage: createAssetLinkOperation.errMessage, errCode: createAssetLinkOperation.errCode };
    operations.push(createAssetLinkOperation.value);
  }

  return { success: true, value: operations };
}

export async function UnequipFeaturesOperations(parent_collection_id: string, parent_token_id: string, oldAttributes: RootDrop[]): Promise<Result<Operation[]>> {
  const operations: Operation[] = [];

  for (const attribute of oldAttributes) {
    const linkedToken = attribute;

    if (!linkedToken) return { success: false, errMessage: 'Linked token not found', errCode: CommonErrorCode.InternalError };

    const [collectionId, tokenId] = linkedToken.collectionId.split(':');

    const deleteAssetLinkOperation = DeleteAssetLinkOperationMessage(attribute.schemaPart, parent_collection_id, parent_token_id, collectionId, tokenId);
    if (!deleteAssetLinkOperation.success) return { success: false, errMessage: deleteAssetLinkOperation.errMessage, errCode: deleteAssetLinkOperation.errCode };
    operations.push(deleteAssetLinkOperation.value);
  }

  return { success: true, value: operations };
}

export async function SetRootNewCombination(parent_tokenId: string, newAttributes: RootDrop[], oldAttributes: RootDrop[]): Promise<Result<boolean>> {
  try {
    const EOA_ADDRESS = (await SIGNER.getAddress()) as `0x${string}`;

    const equipOperations = await EquipFeaturesOperations(NFT_COLLECTION_ID, parent_tokenId, newAttributes);
    const unequipOperations = await UnequipFeaturesOperations(NFT_COLLECTION_ID, parent_tokenId, oldAttributes);


    if (!equipOperations.success || !unequipOperations.success) return { success: false, errMessage: 'Error on setting new combination. All operations must be successful', errCode: CommonErrorCode.InternalError };

    const allOperations = [...unequipOperations.value, ...equipOperations.value];
    const [nonce] = await ASSET_REGISTER_SDK.nonceForChainAddress(EOA_ADDRESS as `0x${string}`).execute();
    const artm = new ARTM({ address: EOA_ADDRESS, statement: STATEMENTS.ASSET_UPDATE, operations: allOperations, nonce });
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
  } catch (e) {
    const err = e as Error;
    void LogError(Module.SolanaContractUtil, "Couldn't set new combination", e);
    return {
      success: false,
      errMessage: err.message,
      errCode: CommonErrorCode.InternalError
    }
  }
}

export function SetAssetTransferableTx(collectionId: string, tokenId: string, transferable: boolean) {
  const transferableTx = API.tx.nft.setTokenTransferableFlag([collectionId, tokenId], transferable);
  return transferableTx;
}

export async function SetRootAssetsTransferable(collectionId: string, tokenId: string, assetOperations: Operation[], oldCombination: string, newCombination: string): Promise<Result<boolean>> {
  try {
    if (assetOperations.length === 0) return { success: false, errMessage: 'No asset operations', errCode: CommonErrorCode.InternalError };

    const txs: SubmittableExtrinsic<"promise">[] = [];

    assetOperations.forEach(operation => {
      const [, , , , collectionId, tokenId] = operation.args[2].split(':');
      if (operation.action === AssetRegistryAction.Create) txs.push(SetAssetTransferableTx(collectionId, tokenId, true))
      else if (operation.action === AssetRegistryAction.Delete) txs.push(SetAssetTransferableTx(collectionId, tokenId, false));
    })

    if (newCombination === CampaignBaseCombination.Based) txs.push(SetAssetTransferableTx(collectionId, tokenId, true)) //If the new combination is base combination, mark avatar as transferable
    else if (oldCombination === CampaignBaseCombination.Based) txs.push(SetAssetTransferableTx(collectionId, tokenId, false)); //If the new combination is not base combination, mark avatar as non transferable

    const batchTx = API.tx.utility.batch(txs);
    await batchTx.signAndSend(KEYRING_SIGNER);

    return { success: true, value: true };
  } catch (e) {
    const err = e as Error;
    void LogError(Module.RootContractUtil, "Couldn't set root assets transferable", err.message);
    return {
      success: false,
      errMessage: err.message,
      errCode: CommonErrorCode.InternalError
    }
  }
}