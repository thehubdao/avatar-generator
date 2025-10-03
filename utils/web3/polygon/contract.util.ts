import { Contract, TransactionResponse } from "ethers";
import { CitizenMetadata, FeaturePolygonDrop } from "../../../interfaces/citizens.interface";
import { Result } from "../../../types/common.type";
import { POLYGON_AVATAR_CONTRACT_ADDRESS, PROVIDER, SIGNER } from "../../../constants/polygon/contract.constant";
import POLYGON_CONTRACT_ABI from "../../../constants/abi/polygon/PolygonContractABI.json";
import POLYGON_WEARABLE_CONTRACT_ABI from "../../../constants/abi/polygon/WearableContractABI.json";
import { LogError } from "../../common.util";
import { CommonErrorCode, Module } from "../../../enums/common.enum";
import { Campaign, PolygonCampaign } from "../../../types/citizens.type";
import { Web3ErrorCode } from "../../../enums/root/common.enum";
import { CampaignDrops } from "../../../types/citizens.type";
import { GetCampaignDrops, GetPolygonImageUrl, GetPolygonIpfsData } from "../citizens.util";
import { CampaignBaseCombinationUrl } from "../../../enums/citizens/common.enum";
import { PolygonCampaignConstant } from "../../../constants/campaign.constant";

export async function GetPolygonTokenIds(address: string): Promise<Result<number[]>> {
    try {
        const avatarContract = new Contract(POLYGON_AVATAR_CONTRACT_ADDRESS, POLYGON_CONTRACT_ABI, PROVIDER);

        const tokenIds = await avatarContract.getTokenIdsByOwner(address) as number[];

        return { success: true, value: tokenIds };
    } catch (error) {
        LogError(Module.PolygonContractUtil, 'Error getting Polygon token IDs', error);
        return { success: false, errMessage: 'Error getting Polygon token IDs', errCode: CommonErrorCode.InternalError };
    }
}

export async function GetCampaignsPolygonTokensMetadata(address: string): Promise<Result<CitizenMetadata[]>> {
    try {
        const avatarContract = new Contract(POLYGON_AVATAR_CONTRACT_ADDRESS, POLYGON_CONTRACT_ABI, PROVIDER);
        const tokenIdsPromise = avatarContract.getTokenIdsByOwner(address) as Promise<number[]>;
        const tokenUrisPromise = avatarContract.getTokenUrisByOwner(address) as Promise<string[]>;

        const [tokenIds, tokenUris] = await Promise.all([tokenIdsPromise, tokenUrisPromise]);

        const metadataPromises = tokenUris.map(async (tokenUri, index) => {
            try {
                const tokenId = tokenIds[index];

                const ipfsDataResult = await GetPolygonIpfsData(tokenUri);

                if (!ipfsDataResult.success || !ipfsDataResult.value) return undefined;

                const metadataJson = ipfsDataResult.value;

                const metadata: CitizenMetadata = {
                    tokenId: tokenId.toString(),
                    campaign: PolygonCampaignConstant.Polygon,
                    baseCombination: metadataJson.baseCombination,
                    combination: metadataJson.combination,
                    fallbackImageUrl: metadataJson.image,
                    imageUrl: metadataJson.image,
                    name: metadataJson.name,
                    description: metadataJson.description,
                    rawMetadata: metadataJson,
                };

                const imageUrl = await GetPolygonImageUrl(metadata);

                if(!imageUrl.success){
                    LogError(Module.PolygonContractUtil, 'Error getting Polygon image url', imageUrl.errMessage);
                    return undefined;
                }

                metadata.imageUrl = imageUrl.value;
                metadata.fallbackImageUrl = imageUrl.value;

                return metadata;
            } catch (error) {
                LogError(Module.PolygonContractUtil, `Error getting metadata`, error);
            }
        });

        const metadataArray = await Promise.all(metadataPromises);
        const filteredMetadataArray = metadataArray.filter((metadata): metadata is CitizenMetadata => metadata !== undefined);

        return { success: true, value: filteredMetadataArray };
    } catch (error) {
        LogError(Module.PolygonContractUtil, 'Error getting Polygon tokens metadata', error);
        return { success: false, errMessage: 'Error getting Polygon tokens metadata', errCode: 'POLYGON_METADATA_ERROR' };
    }
}

export async function MintPolygonCitizen(walletAddress: string): Promise<Result<boolean>> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const avatarContract = new Contract(POLYGON_AVATAR_CONTRACT_ADDRESS, POLYGON_CONTRACT_ABI, SIGNER);

            // Estimate gas first
            const gasEstimate = await avatarContract.mint.estimateGas(walletAddress, CampaignBaseCombinationUrl.Polygon);
            
            // Add 20% buffer to gas estimate
            const gasLimit = Math.ceil(Number(gasEstimate) * 1.2);

            // Get current fee data
            const feeData = await PROVIDER.getFeeData();

            // Use EIP-1559 parameters if available, otherwise fallback to legacy gasPrice
            const txParams: any = { gasLimit };
            
            if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                // Use EIP-1559 gas parameters
                txParams.maxFeePerGas = feeData.maxFeePerGas;
                txParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
            } else if (feeData.gasPrice) {
                // Fallback to legacy gas pricing
                txParams.gasPrice = feeData.gasPrice;
            }

            // Calculate estimated transaction cost before attempting
            let estimatedCost = BigInt(0);
            if (feeData.maxFeePerGas) {
                estimatedCost = BigInt(gasLimit) * feeData.maxFeePerGas;
            } else if (feeData.gasPrice) {
                estimatedCost = BigInt(gasLimit) * feeData.gasPrice;
            }

            // Check user balance before attempting transaction
            const userBalance = await PROVIDER.getBalance(walletAddress);
            
            if (userBalance < estimatedCost) {
                const neededAmount = estimatedCost - userBalance;
                const neededPOL = Number(neededAmount) / 1e18; // Convert wei to POL
                const currentPOL = Number(userBalance) / 1e18; // Convert wei to POL
                
                return {
                    success: false,
                    errMessage: `You have ${currentPOL.toFixed(6)} POL but need ${neededPOL.toFixed(6)} more POL to complete this transaction.`,
                    errCode: Web3ErrorCode.InsufficientFunds
                };
            }

            const tx = await avatarContract.mint(walletAddress, CampaignBaseCombinationUrl.Polygon, txParams) as TransactionResponse;

            await tx.wait();

            return { success: true, value: true };
        } catch (error: any) {
            attempt++;
            
            // Log the specific error
            LogError(Module.PolygonContractUtil, `Error minting Polygon citizen (attempt ${attempt}/${maxRetries})`, error);
            
            // Check if it's a specific error that we should retry
            const errorMessage = error?.message || '';
            const errorCode = error?.code || '';
            
            // Don't retry on certain errors
            if (errorMessage.includes('user rejected') ||
                errorMessage.includes('user denied') ||
                errorCode === 'ACTION_REJECTED') {
                return { 
                    success: false, 
                    errMessage: 'Transaction rejected by user', 
                    errCode: CommonErrorCode.InternalError 
                };
            }
            
            // If it's the last attempt, return error
            if (attempt >= maxRetries) {
                return { 
                    success: false, 
                    errMessage: `Failed to mint after ${maxRetries} attempts. Last error: ${errorMessage}`, 
                    errCode: CommonErrorCode.InternalError 
                };
            }
            
            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    return { success: false, errMessage: 'Unexpected error in minting process', errCode: CommonErrorCode.InternalError };
}

export async function GetPolygonUserFeatureAssets(address: string, campaign: PolygonCampaign): Promise<Result<CampaignDrops<PolygonCampaign>>> {
    try {
    const FeaturePolygonDropsResult = await GetCampaignDrops<FeaturePolygonDrop>(campaign);

    if (!FeaturePolygonDropsResult.success) return FeaturePolygonDropsResult;

    if (FeaturePolygonDropsResult.value.length === 0) return {
        success: false,
        errMessage: "No drops found",
        errCode: CommonErrorCode.GetNoData
    };

    const dropsCheckPromiseList = FeaturePolygonDropsResult.value.map(async (drop) => {
        const wearableContract = new Contract(drop.contractAddress, POLYGON_WEARABLE_CONTRACT_ABI, PROVIDER); //We use avatar contract ABI as we only need the balance function from ERC721
        const tokenIds = await wearableContract.getTokenIdsByOwner(address);

        if (tokenIds.length === 0) return undefined;
        drop.tokenId = Number(tokenIds[0]);
        drop.balance = tokenIds.length;
        return drop;
    });

    const dropsCheck = await Promise.all(dropsCheckPromiseList);
    const filteredDrops = dropsCheck.filter((dropCheck): dropCheck is FeaturePolygonDrop => dropCheck !== undefined);

        return { success: true, value: { [campaign]: filteredDrops } as CampaignDrops<PolygonCampaign> };
    } catch (error) {
        LogError(Module.PolygonContractUtil, 'Error getting Polygon user feature assets', error);
        return { success: false, errMessage: 'Error getting Polygon user feature assets', errCode: CommonErrorCode.InternalError };
    }
}

export async function SetPolygonNewCombination(tokenId: string, uri: string, oldDrops: FeaturePolygonDrop[], newDrops: FeaturePolygonDrop[]): Promise<Result<boolean>> {
    try {
        const avatarContract = new Contract(POLYGON_AVATAR_CONTRACT_ADDRESS, POLYGON_CONTRACT_ABI, SIGNER);
        const wearablesToUnequip: { wearableContract: string; wearableTokenId: number; }[] = oldDrops.map((drop) => ({ wearableContract: drop.contractAddress, wearableTokenId: Number(drop.tokenId) }));
        const wearablesToEquip: { wearableContract: string; wearableTokenId: number; }[] = newDrops.map((drop) => ({ wearableContract: drop.contractAddress, wearableTokenId: Number(drop.tokenId) }));

        // Estimate gas first
        const gasEstimate = await avatarContract.setAvatarNewWearings.estimateGas(tokenId, wearablesToUnequip, wearablesToEquip, uri);
        
        // Add 20% buffer to gas estimate
        const gasLimit = Math.ceil(Number(gasEstimate) * 1.2);

        // Get current fee data
        const feeData = await PROVIDER.getFeeData();

        // Use EIP-1559 parameters if available, otherwise fallback to legacy gasPrice
        const txParams: any = { gasLimit };
        
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            // Use EIP-1559 gas parameters
            txParams.maxFeePerGas = feeData.maxFeePerGas;
            txParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        } else if (feeData.gasPrice) {
            // Fallback to legacy gas pricing
            txParams.gasPrice = feeData.gasPrice;
        }

        const tx = await avatarContract.setAvatarNewWearings(tokenId, wearablesToUnequip, wearablesToEquip, uri, txParams) as TransactionResponse;

        await tx.wait();

        return { success: true, value: true };
    } catch (error) {
        LogError(Module.PolygonContractUtil, 'Error setting Polygon combination', error);
        return { success: false, errMessage: 'Error setting Polygon combination', errCode: CommonErrorCode.InternalError };
    }
}

export async function GetPolygonCollectionSupply(): Promise<Result<number>> {
    try {
        const avatarContract = new Contract(POLYGON_AVATAR_CONTRACT_ADDRESS, POLYGON_CONTRACT_ABI, PROVIDER);
        const supply = await avatarContract.getTotalSupply();
        return { success: true, value: Number(supply) };
    } catch (error) {
        LogError(Module.PolygonContractUtil, 'Error getting Polygon collection supply', error);
        return { success: false, errMessage: 'Error getting Polygon collection supply', errCode: CommonErrorCode.InternalError };
    }
}