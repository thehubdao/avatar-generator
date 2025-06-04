import { createNoopSigner, generateSigner, PublicKey, publicKey, signerIdentity, some, TransactionBuilder, transactionBuilder } from '@metaplex-foundation/umi';
import { AssetV1, execute, fetchAsset, fetchAssetsByOwner, fetchCollection, mplCore, transfer, transferV1, update } from '@metaplex-foundation/mpl-core';
import { Result } from '../../../types/common.type';
import { LogError } from '../../../utils/common.util';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { UMI, COLLECTION_ID, KUMI_CANDY_MACHINE_ID, KUMI_CANDY_MACHINE_TREASURY, COLLECTION_GUARD_ID, ADMIN_SIGNER } from '../../../constants/solana/contract.constant';
import { CitizenMetadata, Drop, SolanaAttribute, SolanaMetadata } from '../../../interfaces/citizens.interface';
import { GetSolanaImageUrl, GetSolanaIPFSData } from '../citizens.util';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { GuardSetMintArgs, mintV1, mplCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';
import {
    fromWeb3JsTransaction,
    toWeb3JsTransaction
} from '@metaplex-foundation/umi-web3js-adapters';
import { Campaign, CandyMachineGroup, SolanaCampaign } from '../../../enums/citizens/common.enum';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { findAssetSignerPda } from '@metaplex-foundation/mpl-core';
import { CampaignDrops } from '../../../types/citizens.type';
import { GetCollectionDocs } from '../../firebase.util';

export async function InitializeUmi(wallet: ConnectedSolanaWallet): Promise<Result<boolean>> {
    try {
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
        return {
            success: true,
            value: true
        };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.SolanaContractUtil, "Couldn't initialize UMI", err.message);
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.InternalError
        };
    }
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
): Promise<Result<AssetV1[]>> {
    const assetsResult = await GetAssetsByOwner(walletAddress);
    if (!assetsResult.success) return {
        success: false,
        errMessage: "Couldn't get assets correctly",
        errCode: CommonErrorCode.GetNoData
    };

    const collectionAsset = assetsResult.value.filter(
        asset => asset.updateAuthority.address === collectionId.toString()
    );

    return {
        success: true,
        value: collectionAsset
    };

}
export async function GetSolanaCitizenMetadata(assetAddress: AssetV1): Promise<Result<CitizenMetadata>> {
    const cid = assetAddress.uri.split('//')[1];
    const ipfsDataResult = await GetSolanaIPFSData(cid); // Get the Solana token metadata from IPFS

    if (!ipfsDataResult.success) return {
        success: false,
        errMessage: ipfsDataResult.errMessage,
        errCode: CommonErrorCode.FetchError
    };

    const solanaMetadata: SolanaMetadata = ipfsDataResult.value as SolanaMetadata;

    solanaMetadata.asset_address = assetAddress.publicKey.toString();

    const citizenMetadata: CitizenMetadata = {
        fallbackImageUrl: '',
        imageUrl: '',
        combination: ipfsDataResult.value.combination,
        baseCombination: ipfsDataResult.value.baseCombination,
        campaign: Campaign.Kumi,
        tokenId: assetAddress.name.split('#')[1],
        name: ipfsDataResult.value.name,
        description: ipfsDataResult.value.description,
        rawMetadata: solanaMetadata
    }

    const imageUrlResult = GetSolanaImageUrl(citizenMetadata);

    if (!imageUrlResult.success) return {
        success: false,
        errMessage: imageUrlResult.errMessage,
        errCode: CommonErrorCode.FetchError
    };

    citizenMetadata.imageUrl = imageUrlResult.value;
    citizenMetadata.fallbackImageUrl = imageUrlResult.value;

    return {
        success: true,
        value: citizenMetadata
    };
}

export async function GetCampaignCitizensMetadata(walletAddress: string): Promise<Result<CitizenMetadata[]>> { //This function will change when we add more campaigns to Solana to handle multiple collectionIds
    const assetsResult = await GetCollectionAssetByOwner(walletAddress, COLLECTION_ID);

    if (!assetsResult.success) return {
        success: false,
        errMessage: assetsResult.errMessage,
        errCode: CommonErrorCode.GetNoData
    };

    if (!assetsResult.value) return {
        success: true,
        value: [] //Return empty array because we don't have any collection asset. Means user has to mint
    };

    const citizensMetadata = await Promise.all(assetsResult.value.map(async (asset) => {
        const citizenMetadataResult = await GetSolanaCitizenMetadata(asset);
        if (!citizenMetadataResult.success) {
            void LogError(Module.SolanaContractUtil, "Couldn't get citizen metadata correctly", citizenMetadataResult.errMessage);
            return undefined
        }
        return citizenMetadataResult.value;
    }));

    return {
        success: true,
        value: citizensMetadata.filter(citizenMetadata => citizenMetadata !== undefined)
    };

}

export async function GetKumiCandyMachineGuardGroup(walletAddress: string, collectionGuardId: PublicKey): Promise<Result<{ group: CandyMachineGroup, mintArgs: GuardSetMintArgs }>> {
    const assetsResult = await GetCollectionAssetByOwner(walletAddress, collectionGuardId);
    if (!assetsResult.success) return {
        success: false,
        errMessage: assetsResult.errMessage,
        errCode: CommonErrorCode.GetNoData
    };

    if (assetsResult.value && assetsResult.value.length > 0) return {
        success: true,
        value: { group: CandyMachineGroup.Holder, mintArgs: { solPayment: some({ destination: KUMI_CANDY_MACHINE_TREASURY }), assetGate: some({ asset: assetsResult.value[0].publicKey }) } }
    };

    return {
        success: true,
        value: { group: CandyMachineGroup.Public, mintArgs: { solPayment: some({ destination: KUMI_CANDY_MACHINE_TREASURY }) } }
    };
}

export async function GetMintingPrice(walletAddress: string): Promise<Result<{ price: number, isHolder?: boolean }>> {
    const mintingPrice = await GetKumiCandyMachineGuardGroup(walletAddress, COLLECTION_GUARD_ID);
    if (!mintingPrice.success) return {
        success: false,
        errMessage: mintingPrice.errMessage,
        errCode: CommonErrorCode.GetNoData
    };

    if (mintingPrice.value.group === CandyMachineGroup.Holder) return {
        success: true,
        value: {
            price: 0.0042, // This is the price for holders
            isHolder: true
        }
    };
    if (mintingPrice.value.group === CandyMachineGroup.Public) return {
        success: true,
        value: {
            price: 0.2, // This is the price for public
            isHolder: false
        }
    };

    return {
        success: false,
        errMessage: "Couldn't get minting price correctly",
        errCode: CommonErrorCode.GetNoData
    };
}
export async function MintKumiCitizen(): Promise<Result<boolean>> {
    try {
        const nftAccount = generateSigner(UMI); //Generate a new NFT account address
        const groupResult = await GetKumiCandyMachineGuardGroup(UMI.identity.publicKey, COLLECTION_GUARD_ID);

        if (!groupResult.success) return {
            success: false,
            errMessage: groupResult.errMessage,
            errCode: CommonErrorCode.GetNoData
        };

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
    } catch (e) {
        const err = e as Error
        void LogError(Module.SolanaContractUtil, "Couldn't mint kumi citizen", e);
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.InternalError
        };
    }
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

export async function GetUserFeatureAssets(walletAddress: string, campaign: SolanaCampaign): Promise<Result<CampaignDrops<SolanaCampaign>>> {
    try {
        const assetsResult = await GetAssetsByOwner(walletAddress);
        const userFeatures: Drop[] = await GetCollectionDocs(`campaign/${campaign}/drops`) as Drop[];

        if (!assetsResult.success) return {
            success: false,
            errMessage: assetsResult.errMessage,
            errCode: CommonErrorCode.GetNoData
        };

        let userFeaturesAssets = userFeatures.map(feature => { // For solana, we set the asset address instead of the collection address as it works different
            const asset = assetsResult.value.find(asset => asset.updateAuthority.address === feature.contract_address);

            if (!asset) return undefined;

            return {
                ...feature,
                contract_address: asset.publicKey.toString()
            };
        })

        userFeaturesAssets = userFeaturesAssets.filter(feature => feature !== undefined);

        return {
            success: true,
            value: { [campaign]: userFeaturesAssets as Drop[] }
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

export async function TransferToAsset(assetAddress: string, sourceAssetAddress: string): Promise<Result<TransactionBuilder>> {
    try {
        const sourceAssetPublicKey = publicKey(sourceAssetAddress);
        const sourceAssetPda = findAssetSignerPda(UMI, { asset: sourceAssetPublicKey });
        const assetPublicKey = publicKey(assetAddress);
        const asset = await fetchAsset(UMI, assetPublicKey);
        const collection =
            asset.updateAuthority.type == 'Collection' && asset.updateAuthority.address
                ? await fetchCollection(UMI, asset.updateAuthority.address)
                : undefined;
        const transferInstruction = transferV1(UMI, {
            collection: collection?.publicKey,
            asset: assetPublicKey,
            newOwner: sourceAssetPda,
        });

        return {
            success: true,
            value: transferInstruction
        };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.SolanaContractUtil, "Couldn't build transfer to asset instruction", e);
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.InternalError
        };
    }
}

export async function TransferFromAsset(assetAddress: string, sourceAssetAddress: string): Promise<Result<TransactionBuilder>> {
    try {
        const sourceAssetPublicKey = publicKey(sourceAssetAddress);
        const sourceAssetPda = findAssetSignerPda(UMI, { asset: sourceAssetPublicKey });
        const sourceAssetPdaSigner = createNoopSigner(sourceAssetPda[0]);
        const sourceAsset = await fetchAsset(UMI, sourceAssetPublicKey);

        const sourceCollection =
            sourceAsset.updateAuthority.type == 'Collection' && sourceAsset.updateAuthority.address
                ? await fetchCollection(UMI, sourceAsset.updateAuthority.address)
                : undefined;

        const asset = await fetchAsset(UMI, publicKey(assetAddress));

        const collection =
            asset.updateAuthority.type == 'Collection' && asset.updateAuthority.address
                ? await fetchCollection(UMI, asset.updateAuthority.address)
                : undefined;

        const transferAssetTx = transfer(UMI, {
            asset,
            collection,
            authority: sourceAssetPdaSigner,
            newOwner: UMI.identity.publicKey,
        });

        const executeInstruction = execute(UMI, {
            asset: sourceAsset,
            collection: sourceCollection,
            instructions: transferAssetTx,
            assetSigner: sourceAssetPda,
        });

        return {
            success: true,
            value: executeInstruction
        };

    } catch (e) {
        const err = e as Error;
        void LogError(Module.SolanaContractUtil, "Couldn't build transfer from asset instruction", e);
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.InternalError
        };
    }
}

async function UpdateAsset(assetAddress: string, uri: string): Promise<Result<TransactionBuilder>> {
    try {
        const assetPublicKey = publicKey(assetAddress);
        const asset = await fetchAsset(UMI, assetPublicKey);

        const collection = asset.updateAuthority.type == 'Collection' && asset.updateAuthority.address
            ? await fetchCollection(UMI, asset.updateAuthority.address)
            : undefined;

        const updateAssetInstruction = update(UMI, {
            asset,
            collection,
            uri,
            payer: createNoopSigner(UMI.identity.publicKey),
            authority: ADMIN_SIGNER,
        });

        return {
            success: true,
            value: updateAssetInstruction
        };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.SolanaContractUtil, "Couldn't build update asset instruction", e);
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.InternalError
        }
    }
}

async function UnequipFeatures(assetAddress: string, features: SolanaAttribute[]): Promise<Result<TransactionBuilder>> {
    let txBuilder = transactionBuilder();

    for (let index = 0; index < features.length; index++) {
        const feature = features[index];
        const transferFromAssetInstruction = await TransferFromAsset(feature.asset_address as string, assetAddress);

        if (!transferFromAssetInstruction.success) return {
            success: false,
            errMessage: "Couldn't complete unequip features transaction building",
            errCode: CommonErrorCode.InternalError
        };
        txBuilder = txBuilder.add(transferFromAssetInstruction.value);
    }

    return {
        success: true,
        value: txBuilder
    };

}
export async function EquipFeatures(assetAddress: string, features: SolanaAttribute[]): Promise<Result<TransactionBuilder>> {
    let txBuilder = transactionBuilder();

    for (let index = 0; index < features.length; index++) {
        const feature = features[index];
        const transferToAssetInstruction = await TransferToAsset(feature.asset_address as string, assetAddress);

        if (!transferToAssetInstruction.success) return {
            success: false,
            errMessage: "Couldn't complete transaction building",
            errCode: CommonErrorCode.InternalError
        };

        txBuilder = txBuilder.add(transferToAssetInstruction.value);
    }

    return {
        success: true,
        value: txBuilder
    };
}

export async function SetNewCombination(assetAddress: string, metadataIpfsCid: string, newFeatures: SolanaAttribute[], oldFeatures: SolanaAttribute[]): Promise<Result<boolean>> {
    try {
        let txBuilder = transactionBuilder();
        const updateAssetInstruction = await UpdateAsset(assetAddress, `ipfs://${metadataIpfsCid}`);

        if (!updateAssetInstruction.success) return {
            success: false,
            errMessage: "Couldn't complete transaction building",
            errCode: CommonErrorCode.InternalError
        };
        txBuilder = txBuilder.add(updateAssetInstruction.value);

        const equipFeaturesInstruction = await EquipFeatures(assetAddress, newFeatures);

        if (!equipFeaturesInstruction.success) return {
            success: false,
            errMessage: "Couldn't complete transaction building",
            errCode: CommonErrorCode.InternalError
        };
        txBuilder = txBuilder.add(equipFeaturesInstruction.value);

        const unequipFeaturesInstruction = await UnequipFeatures(assetAddress, oldFeatures);

        if (!unequipFeaturesInstruction.success) return {
            success: false,
            errMessage: "Couldn't complete transaction building",
            errCode: CommonErrorCode.InternalError
        };
        txBuilder = txBuilder.add(unequipFeaturesInstruction.value);

        await txBuilder.sendAndConfirm(UMI, { send: { commitment: 'finalized' } });

        return {
            success: true,
            value: true
        }
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