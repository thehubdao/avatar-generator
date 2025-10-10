import { MINT_AMOUNT, NFT_COLLECTION_ID, API, SIGNER, ASSET_REGISTER_SDK, ROOT_SIGNER_PK, KEYRING_SIGNER, BASE_ETH_NUMBER, ROOT_TOKEN_ID, SESSION, XRP_ASSET_ID } from '../../../constants/root/contract.constant';
import { TransactionBuilder } from '@futureverse/transact';
import { Result } from '../../../types/common.type';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { LogError } from '../../common.util';
import '@therootnetwork/api-types';
import { GetAssetData, GetClaimableDrops, StoreAssetData } from '../../firebase.util';
import { Blockchain } from '../../../enums/blockchain/common.enum';
import { Campaign, RootCampaign } from '../../../types/citizens.type';
import { CitizenMetadata, FeatureClaimableDrop, FeatureDrop, FeatureRootDrop, LinkableToken, MintingPriceData, RootMetadata } from '../../../interfaces/citizens.interface';
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
import { AssetRegistryAction, Web3ErrorCode } from '../../../enums/root/common.enum';
import { CampaignBaseCombination } from '../../../enums/citizens/common.enum';
import { RootCampaignConstant } from '../../../constants/campaign.constant';

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

export async function GetRootSftBalance(address: string, sftCollectionId: string, sftTokenId: string): Promise<Result<number>> {
  try {
    const token = await API.query.sft.tokenInfo([
      sftCollectionId,
      sftTokenId,
    ]);

    console.log(sftCollectionId, sftTokenId)

    const info = token.toHuman() as {
      tokenName: string;
      ownedTokens: [
        string,
        { freeBalance: string; reservedBalance: string },
      ][];
    };

    console.log(info)

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
    console.log(e)
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
    const assetDataResult = await GetAssetData(RootCampaignConstant.Based, NFT_COLLECTION_ID as string, tokenId);

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
    if (walletIntBalance < mintIntFees + mintPrice) {
      return { success: false, errMessage: "Insufficient balance. You need " + Number(mintIntFees + mintPrice) + " ROOT in your Future Pass to mint this asset.", errCode: Web3ErrorCode.InsufficientFunds };
    }

    await mintBuilder.signAndSend();
    const tokenIdsResult = await GetRootAssetTokenIds(address, NFT_COLLECTION_ID);
    if (tokenIdsResult.success) {
      const tokenIds = tokenIdsResult.value;
      const tokenId = tokenIds[tokenIds.length - 1].toString();
      await StoreAssetData({
        tokenId,
        campaign: RootCampaignConstant.Based,
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
  return { success: true, value: { mintPrice: 124, mintingPriceSymbol: 'ROOT' } };
}

export async function GetRootUserFeatureAssets(address: string, campaign: RootCampaign): Promise<Result<CampaignDrops<RootCampaign>>> {
  try {
    const featureRootClaimableDrops = await GetCampaignDrops<FeatureRootDrop>(campaign);
    if (!featureRootClaimableDrops.success) return featureRootClaimableDrops;

    if (featureRootClaimableDrops.value.length === 0) return {
      success: false,
      errMessage: "No drops found",
      errCode: CommonErrorCode.GetNoData
    };
    const dropsCheckPromiseList = featureRootClaimableDrops.value.map(async (drop) => {
      if (!drop.collectionId) return null;
      const [collectionId, tokenId] = drop.collectionId.split(':');
      const linkedBalanceResult = await GetSFTAssetLinks(collectionId, tokenId, address);
      console.log(linkedBalanceResult)

      if (!linkedBalanceResult.success) return null;

      const linkedBalance = linkedBalanceResult.value.length;

      const onchainBalanceResult = await GetRootSftBalance(address, collectionId, tokenId);
      console.log(onchainBalanceResult)
      if (!onchainBalanceResult.success) return null;

      const onchainBalance = onchainBalanceResult.value;

      drop.balance = onchainBalance - linkedBalance;

      if (drop.balance === 0) return null;

      return drop;
    });

    const dropsCheck = await Promise.all(dropsCheckPromiseList);
    const filteredDrops = dropsCheck.filter((dropCheck) => dropCheck !== null); //Filter out the drops that are linkable

    return {
      success: true,
      value: { [campaign]: filteredDrops } as CampaignDrops<RootCampaign>
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

export async function GetRootClaimableDrops(address: string): Promise<Result<Record<RootCampaign, FeatureClaimableDrop[]>>> {
  try {
    const featureRootDrops = await GetClaimableDrops(RootCampaignConstant.Based);
    if (!featureRootDrops.success) return featureRootDrops;

    if (featureRootDrops.value.length === 0) return {
      success: false,
      errMessage: "No drops found",
      errCode: CommonErrorCode.GetNoData
    };
    const dropsCheckPromiseList = featureRootDrops.value.map(async (drop) => {
      console.log(drop);
      if (!drop.collectionId) return null;
      const [collectionId, tokenId] = drop.collectionId.split(':');
      const balance = await GetRootSftBalance(address, collectionId, tokenId);

      if (!balance.success) return null;

      drop.isLimitReached = balance.value >= drop.claimLimit;

      return drop;
    });

    const dropsCheck = await Promise.all(dropsCheckPromiseList);
    const filteredDrops = dropsCheck.filter((dropCheck) => dropCheck !== null); //Filter out the drops that are null

    return {
      success: true,
      value: { [RootCampaignConstant.Based]: filteredDrops as FeatureDrop[] as FeatureClaimableDrop[] }
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

export async function EquipFeaturesOperations(parent_collection_id: string, parent_token_id: string, newAttributes: FeatureRootDrop[]): Promise<Result<Operation[]>> {
  const operations: Operation[] = [];

  for (const attribute of newAttributes) {
    if (!attribute.collectionId) return { success: false, errMessage: 'Linked token collection ID not found', errCode: CommonErrorCode.InternalError };
    const [collectionId, tokenId] = attribute.collectionId.split(':');
    const createAssetLinkOperation = CreateAssetLinkOperationMessage(attribute.schemaPart, parent_collection_id, parent_token_id, collectionId, tokenId);
    console.log(createAssetLinkOperation)
    if (!createAssetLinkOperation.success) return { success: false, errMessage: createAssetLinkOperation.errMessage, errCode: createAssetLinkOperation.errCode };
    operations.push(createAssetLinkOperation.value);
  }

  return { success: true, value: operations };
}

export async function UnequipFeaturesOperations(parent_collection_id: string, parent_token_id: string, oldAttributes: FeatureRootDrop[]): Promise<Result<Operation[]>> {
  const operations: Operation[] = [];

  for (const attribute of oldAttributes) {
    const linkedToken = attribute;

    if (!linkedToken) return { success: false, errMessage: 'Linked token not found', errCode: CommonErrorCode.InternalError };


    if (!linkedToken.collectionId) return { success: false, errMessage: 'Linked token collection ID not found', errCode: CommonErrorCode.InternalError };

    const [collectionId, tokenId] = linkedToken.collectionId.split(':');

    const deleteAssetLinkOperation = DeleteAssetLinkOperationMessage(attribute.schemaPart, parent_collection_id, parent_token_id, collectionId, tokenId);
    if (!deleteAssetLinkOperation.success) return { success: false, errMessage: deleteAssetLinkOperation.errMessage, errCode: deleteAssetLinkOperation.errCode };
    operations.push(deleteAssetLinkOperation.value);
  }

  return { success: true, value: operations };
}

export async function SetRootNewCombination(parent_tokenId: string, newAttributes: FeatureRootDrop[], oldAttributes: FeatureRootDrop[]): Promise<Result<boolean>> {
  try {
    const EOA_ADDRESS = (await SIGNER.getAddress()) as `0x${string}`;

    const equipOperations = await EquipFeaturesOperations(NFT_COLLECTION_ID, parent_tokenId, newAttributes);
    const unequipOperations = await UnequipFeaturesOperations(NFT_COLLECTION_ID, parent_tokenId, oldAttributes);
console.log(equipOperations, unequipOperations)

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
    console.log(err, "COULD NOT SAVE NEW COMBINATION")
    void LogError(Module.SolanaContractUtil, "Couldn't set new combination", e);
    return {
      success: false,
      errMessage: err.message,
      errCode: CommonErrorCode.InternalError
    }
  }
}

export async function ClaimRootDrops(dropsToClaim: FeatureClaimableDrop[]): Promise<Result<boolean>> {
  try {
    // Root Network: Solo permite 1 drop a la vez
    if (dropsToClaim.length === 0) {
      return { success: false, errMessage: 'No drops to claim', errCode: CommonErrorCode.InternalError };
    }

    if (dropsToClaim.length > 1) {
      return { success: false, errMessage: 'Root Network only allows claiming 1 drop at a time', errCode: CommonErrorCode.InternalError };
    }

    const drop = dropsToClaim[0];

    if (!drop.collectionId) {
      return { success: false, errMessage: 'Drop collection ID not found', errCode: CommonErrorCode.InternalError };
    }

    const [collectionId, tokenId] = drop.collectionId.split(':');

    // Crear builder para el SFT mint
    const builder = TransactionBuilder.sft(API, SIGNER, SESSION.eoa, Number(collectionId))
      .mint({
        serialNumbers: [{ tokenId: Number(tokenId), quantity: 1 }],
        walletAddress: SESSION.futurepass
      });

    // Agregar FuturePass (pagando fees en ROOT)
    await builder.addFuturePass(SESSION.futurepass);

    // Calcular gas fees
    const mintBigIntFees = await builder.getGasFees();
    const ROOT_DECIMALS = 18;

    // Los fees vienen en ROOT (18 decimals)
    const feesInRoot = Number(mintBigIntFees.gasFee) / Math.pow(10, ROOT_DECIMALS);

    // Verificar balance en ROOT
    const { balance: walletBigIntBalance } = await builder.checkBalance({
      walletAddress: SESSION.futurepass,
      assetId: ROOT_TOKEN_ID // ROOT nativo
    });
    const walletIntBalance = Number(walletBigIntBalance) / Math.pow(10, ROOT_DECIMALS);

    console.log('=== Fee Debug ===');
    console.log('Fees in ROOT:', feesInRoot);
    console.log('ROOT Balance:', walletIntBalance);

    if (walletIntBalance < feesInRoot) {
      return {
        success: false,
        errMessage: `Insufficient ROOT balance. You need approximately ${feesInRoot.toFixed(4)} ROOT in your FuturePass to claim this drop. Current balance: ${walletIntBalance.toFixed(4)} ROOT`,
        errCode: Web3ErrorCode.InsufficientFunds
      };
    }

    // Firmar y enviar (el builder espera la confirmación automáticamente)
    await builder.signAndSend();

    return { success: true, value: true };
  } catch (error) {
    const e = error as Error;
    throw e;
    LogError(Module.RootContractUtil, 'Error claiming Root drop', e.message);
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
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