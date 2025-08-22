import { Contract, ethers, JsonRpcSigner } from 'ethers';
import AvatarContractAbi from '../../../constants/abi/AvatarContractABI.json';
import { ClaimableDrop, Drop, DropToClaim, LuksoAttribute, LuksoDrop, TokenId } from '../../../interfaces/citizens.interface';
import { GetLuksoImageUrl, GetFollowStatuses, GetLuksoIPFSData, GetUniversalProfileData } from '../citizens.util';
import noMetadataTokens from '../../../constants/lukso/NoMetadataTokens.json';
import { CitizenMetadata } from '../../../interfaces/citizens.interface';
import { Result } from '../../../types/common.type';
import { LogError } from '../../../utils/common.util';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { Campaign, LuksoCampaign } from '../../../enums/citizens/common.enum';
import { LUKSO_CAMPAIGN_WEB3_DATA, AVATAR_ERC725_CONTRACT, PROVIDER, TEMP_CAMPAIGN_SWITCH, UNIVERSAL_PROFILE_CONTRACT, OPERATION_CALL, EOA, WEARABLE_ADMIN_SIGNER } from '../../../constants/lukso/contract.constant';
import { GetCollectionDocs, GetLeaderboardData } from '../../firebase.util';
import WearableContractABI from '../../../constants/abi/WearableContractABI.json'
import OldWearableContractABI from '../../../constants/abi/OldWearableContractABI.json'
import AvatarContractExtensionAbi from '../../../constants/abi/AvatarContractExtensionABI.json';
import UniversalProfileABI from '../../../constants/abi/UniversalProfileABI.json'
import { CampaignDrops } from '../../../types/citizens.type';
import { LeaderboardEntry } from '../../../types/leaderboard.type';
import { Blockchain } from '../../../enums/blockchain/common.enum';
import { DropType } from '../../../enums/lukso/common.enum';

export async function GetTokensOf(contractAddress: string, address: string): Promise<Result<string[]>> {
    try {
        const contract = new Contract(contractAddress, AvatarContractAbi, PROVIDER);
        const tokenIds: string[] = [...await contract.tokenIdsOf(address)]; //This cast to array is made from Proxy(Result) to array

        return { success: true, value: tokenIds };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.LuksoContractUtil, 'Error getting tokens', e);
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.FetchError
        };
    }
}

export async function GetCampaignTokenIds(campaignAddress: string, address: string): Promise<Result<string[]>> {
    const tokenIdsResult = await GetTokensOf(campaignAddress, address);
    if (!tokenIdsResult.success) return { success: false, errMessage: tokenIdsResult.errMessage, errCode: tokenIdsResult.errCode };

    return { success: true, value: tokenIdsResult.value };
}

export async function GetEthereumCampaignsTokenIds(address: string): Promise<Result<TokenId[]>> {
    try {
        let campaignsTokenIds = [] as TokenId[];

        for (const campaign of Object.keys(LUKSO_CAMPAIGN_WEB3_DATA).filter((campaign) => campaign)) {
            const typpedCampaign = campaign as keyof typeof LUKSO_CAMPAIGN_WEB3_DATA;
            const { contractAddress } = LUKSO_CAMPAIGN_WEB3_DATA[typpedCampaign];

            const tokenIdsResult = await GetCampaignTokenIds(contractAddress, address);
            if (!tokenIdsResult.success) continue;

            let tokenIds = tokenIdsResult.value;
            if (campaign === 'vrm_female') {
                tokenIds = tokenIds.filter((tokenId) => !noMetadataTokens.includes(Number(tokenId)));
            }

            if (!tokenIds || tokenIds.length == 0) continue;

            const tokensMetadataUrls = await GetCampaignTokenMetadataUris(campaign as Campaign, tokenIds);
            if (!tokensMetadataUrls.success) continue;

            const formattedTokenIds = tokenIds.map((tokenId, index) => {
                const metadataUri = tokensMetadataUrls.value[index];
                return {
                    tokenId: Number(tokenId).toString(),
                    campaign,
                    metadataUri
                } as TokenId;
            });

            campaignsTokenIds = campaignsTokenIds.concat(formattedTokenIds);
        }

        return { success: true, value: campaignsTokenIds };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.LuksoContractUtil, 'Error getting campaigns tokenIds', e);
        return {
            success: false,
            errMessage: err.message,
            errCode: ''
        };
    }
}

export async function GetCampaignTokenMetadataUris(campaign: Campaign, tokenIds: string[]): Promise<Result<string[]>> {
    try {
        const { contractAddress } = LUKSO_CAMPAIGN_WEB3_DATA[campaign];
        const contract = new Contract(contractAddress, AvatarContractAbi, PROVIDER);
        const metadataDataKey = AVATAR_ERC725_CONTRACT.encodeKeyName('LSP4Metadata');
        const metadataKeyArray = tokenIds.map(() => metadataDataKey);

        const getDataBatchForTokenIdsTx = await contract.getDataBatchForTokenIds(
            tokenIds,
            metadataKeyArray
        );

        const metadataFormattedArray = getDataBatchForTokenIdsTx.map((rawData: string) => {
            return { keyName: metadataDataKey, value: rawData };
        });

        const decodedRawData = AVATAR_ERC725_CONTRACT.decodeData(metadataFormattedArray);
        const decodedDataArray = JSON.parse(JSON.stringify(decodedRawData));

        const { baseCid } = LUKSO_CAMPAIGN_WEB3_DATA[campaign];
        const formattedDataArray = decodedDataArray.map((data: { value: { url: string }; }, index: number) => {
            const { value: metadataUri } = data;
            return metadataUri ? metadataUri.url.split('//')[1] : `${baseCid}/${Number(tokenIds[index])}`;
        });

        return { success: true, value: formattedDataArray };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.LuksoContractUtil, 'Error getting campaign token metadata URIs', e);
        return {
            success: false,
            errMessage: err.message,
            errCode: ''
        };
    }
}

export async function GetLuksoTokenMetadata(tokenId: TokenId): Promise<Result<CitizenMetadata>> {
    const ipfsDataResult = await GetLuksoIPFSData(tokenId.metadataUri);
    if (!ipfsDataResult.success || !ipfsDataResult.value) return { success: false, errMessage: 'Error on getting token metadata', errCode: '' };

    const luksoMetadata = ipfsDataResult.value;
    console.log(luksoMetadata)
    const metadata = {
        tokenId: tokenId.tokenId,
        campaign: tokenId.campaign as Campaign,
        combination: luksoMetadata.combination,
        baseCombination: luksoMetadata.baseCombination,
        imageUrl: luksoMetadata.imageUrl,
        fallbackImageUrl: luksoMetadata.fallbackImageUrl,
        rawMetadata: luksoMetadata,
    } as CitizenMetadata;

    if (!luksoMetadata.baseCombination && luksoMetadata.body) metadata.baseCombination = Object.values(luksoMetadata.body).map(({ index }) => index).join('-'); //If base combination don't exist, take it from body and set
    if (!luksoMetadata.combination) metadata.combination = metadata.baseCombination; //If combination don't exist, take it from base combination
    metadata.imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${TEMP_CAMPAIGN_SWITCH[tokenId.campaign as keyof typeof TEMP_CAMPAIGN_SWITCH]}%2Favatar_images%2F${metadata.combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`;
    const imageUrlResult = GetLuksoImageUrl(metadata);
    if (imageUrlResult.success) metadata.fallbackImageUrl = imageUrlResult.value; // There could be some cases where the image url is not valid

    return { success: true, value: metadata };
}

export async function GetTokensMetadata(campaign: Campaign, tokenIds: string[]): Promise<Result<CitizenMetadata[]>> {
    const { contractAddress, baseCid } = LUKSO_CAMPAIGN_WEB3_DATA[campaign];
    try {
        const contract = new Contract(contractAddress, AvatarContractAbi, PROVIDER);
        const metadataDataKey = AVATAR_ERC725_CONTRACT.encodeKeyName('LSP4Metadata');
        const metadataKeyArray = tokenIds.map(() => metadataDataKey);
        const getDataBatchForTokenIdsTx = await contract.getDataBatchForTokenIds(
            tokenIds,
            metadataKeyArray
        );
        const metadataFormattedArray = getDataBatchForTokenIdsTx.map((rawData: string) => {
            return { keyName: metadataDataKey, value: rawData };
        });
        const decodedRawData = AVATAR_ERC725_CONTRACT.decodeData(metadataFormattedArray);
        const decodedDataArray = JSON.parse(JSON.stringify(decodedRawData));

        const metadataPromises = tokenIds.map(async (tokenId, index) => {
            const tokenIdNumber = Number(tokenId).toString();
            const decodedData = decodedDataArray[index];
            const metadataUri = decodedData.value ? decodedData.value.url.split('//')[1] : `${baseCid}/${tokenIdNumber}`;

            if (!baseCid && !decodedData.value) return null;

            const tokenMetadataResult = await GetLuksoTokenMetadata({ metadataUri, campaign, tokenId: tokenIdNumber });

            if (!tokenMetadataResult.success) return null;

            return tokenMetadataResult.value;
        })
        const metadatasResultArray = await Promise.all(metadataPromises);
        const metadatasArray = metadatasResultArray.filter((metadata) => metadata !== null) as CitizenMetadata[];

        return { success: true, value: metadatasArray };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.LuksoContractUtil, 'Error getting tokens metadata', e);
        return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError };
    }
}

export async function GetCampaignTokensMetadata(campaign: Campaign, address: string): Promise<Result<CitizenMetadata[]>> {
    const { contractAddress } = LUKSO_CAMPAIGN_WEB3_DATA[campaign];
    const typpedCampaign = campaign as keyof typeof LUKSO_CAMPAIGN_WEB3_DATA;
    const tokenIds = await GetCampaignTokenIds(contractAddress, address);

    if (!tokenIds.success) return { success: false, errMessage: tokenIds.errMessage, errCode: tokenIds.errCode };

    const tokensMetadataResult = await GetTokensMetadata(typpedCampaign as Campaign, tokenIds.value);

    if (!tokensMetadataResult.success) return { success: false, errMessage: tokensMetadataResult.errMessage, errCode: tokensMetadataResult.errCode };

    return { success: true, value: tokensMetadataResult.value };
}

export async function GetCampaignsTokensMetadata(address: string): Promise<Result<CitizenMetadata[]>> {
    let hasErrors = false;
    const campaignsMetadatasPromises = Object.keys(LUKSO_CAMPAIGN_WEB3_DATA).map(async (campaign) => {
        const tokensMetadataResult = await GetCampaignTokensMetadata(campaign as Campaign, address);

        if (!tokensMetadataResult.success) {
            hasErrors = true;
            return null;
        }

        return tokensMetadataResult.value;
    });
    const campaignsMetadatasResult = await Promise.all(campaignsMetadatasPromises);
    const campaignsMetadatasArray = campaignsMetadatasResult.filter((metadata) => metadata !== null);
    const campaignsMetadatas = campaignsMetadatasArray.flat();

    if (hasErrors && campaignsMetadatas.length === 0) return { success: false, errMessage: 'No tokens metadata were loaded correctly', errCode: CommonErrorCode.FetchError };

    return { success: true, value: campaignsMetadatas as CitizenMetadata[] };
}

export async function GetCampaignUserFeatures(address: string, campaign: string): Promise<Result<LuksoDrop[]>> {
    try {
        const dropsData: LuksoDrop[] = await GetCollectionDocs(`campaign/${campaign}/drops`) as LuksoDrop[];

        const balancePromises = dropsData.map(async drop => {
            const contract = new Contract(drop.contract_address, WearableContractABI, PROVIDER);
            if (drop.dropType === DropType.LSP8) {
                return contract.tokenIdsOf(address).then(tokenIds => {
                    return { ...drop, tokenId: tokenIds.length > 0 ? Number(BigInt(tokenIds[0])).toString() : undefined } as LuksoDrop;
                });
            }
            else return contract.balanceOf(address).then(balance => ({
                ...drop,
                balance: Number(balance)
            }));
        });
        const results: LuksoDrop[] = await Promise.all(balancePromises);
        const features = results
            .filter(({ balance, tokenId }) => (balance && balance > 0) || tokenId);

        return { success: true, value: features };
    } catch (error) {
        console.error('Error getting campaign user features:', error);
        return {
            success: false,
            errMessage: 'Error getting campaign user features',
            errCode: CommonErrorCode.FetchError
        };
    }
}

export async function GetUserFeatures(address: string): Promise<Result<CampaignDrops<LuksoCampaign>>> {
    try {
        const campaigns = Object.keys(LUKSO_CAMPAIGN_WEB3_DATA);
        const campaignPromises = campaigns.map(campaign =>
            GetCampaignUserFeatures(address, campaign)
        );

        const results = await Promise.all(campaignPromises);

        const features = campaigns.reduce((acc, campaign, index) => {
            const result = results[index];
            if (result.success) {
                acc[campaign as keyof typeof LUKSO_CAMPAIGN_WEB3_DATA] = result.value;
            } else {
                acc[campaign as keyof typeof LUKSO_CAMPAIGN_WEB3_DATA] = [];
            }
            return acc;
        }, {} as CampaignDrops<LuksoCampaign>);

        return { success: true, value: features };
    } catch (error) {
        return {
            success: false,
            errMessage: 'Error getting user features',
            errCode: CommonErrorCode.FetchError
        };
    }
}

export async function GetFullLeaderboardData(walletAddress: string): Promise<Result<LeaderboardEntry[]>> {
    const leaderboardData = await GetLeaderboardData(Blockchain.Ethereum);

    const followStatusesPromise = GetFollowStatuses(leaderboardData, PROVIDER, walletAddress);
    const profileDataPromises = leaderboardData.map(async (entry: LeaderboardEntry) => {
        const profileData = await GetUniversalProfileData(entry.address);
        if (!profileData.success) return entry;
        return {
            ...entry,
            name: profileData.success ? profileData.value.name : entry.name,
            profileImage: profileData.success ? profileData.value.profileImage : entry.profileImage,
            isFollowing: false
        } as LeaderboardEntry;
    }
    );

    const [followStatusesResult, ...leaderboardWithProfileData] = await Promise.all([
        followStatusesPromise,
        ...profileDataPromises
    ]) as [Result<Record<string, boolean>>, ...LeaderboardEntry[]];

    if (!followStatusesResult.success) {
        return {
            success: false,
            errMessage: 'Error getting follow statuses',
            errCode: CommonErrorCode.FetchError
        };
    }

    const followStatuses = followStatusesResult.value;

    const finalLeaderboardData = leaderboardWithProfileData.map(entry => ({
        ...entry,
        isFollowing: followStatuses[entry.address] || false
    }));

    return { success: true, value: finalLeaderboardData };
}

async function SignClaimMessageFromAdmin(wearableAddress: string, walletAddress: string) {
    if (!WEARABLE_ADMIN_SIGNER) throw new Error('Wearable admin signer is not defined');
    const wearableContract = new Contract(wearableAddress, WearableContractABI, PROVIDER);
    const nonce = Number(await wearableContract.getUserNonce(walletAddress));

    const message = wearableAddress.toLowerCase() + ':' + walletAddress.toLowerCase() + ':' + nonce.toString();

    const signature = await WEARABLE_ADMIN_SIGNER.signMessage(message);

    return signature;
}

export async function SetAvatarNewWearings(campaign: Campaign, oldAttributes: LuksoAttribute[], newAttributes: LuksoAttribute[], tokenId: string, metadataUri: string, signer: JsonRpcSigner): Promise<Result<void>> {
    const targetContractAddress = LUKSO_CAMPAIGN_WEB3_DATA[campaign].contractAddress;

    const UPContract = new ethers.Contract(
        signer.address as string,
        UniversalProfileABI,
        PROVIDER,
    );

    const metadataUrl = `ipfs://${metadataUri}`;
    const metadataIpfsData = await GetLuksoIPFSData(metadataUrl.split('//')[1]);

    if(!metadataIpfsData.success) {
        console.error('Error fetching metadata IPFS data:', metadataIpfsData.errMessage);
        return { success: false, errMessage: metadataIpfsData.errMessage, errCode: metadataIpfsData.errCode };
    }

    const metadataDataValue = AVATAR_ERC725_CONTRACT.encodeData([
        {
            keyName: 'LSP4Metadata',
            value: {
                json: {'LSP4Metadata':metadataIpfsData.value},
                url: metadataUrl,
            },
        },
    ]);
    console.log(metadataIpfsData, metadataUrl, metadataDataValue.values[0]);
    const wearablesToUnequip = oldAttributes.map((attribute) => ({
        wearableContract: attribute.wearable_address, wearableTokenId: Number(attribute.wearable_token_id)
    }));

    const wearablesToEquip = newAttributes.map((attribute) => ({
        wearableContract: attribute.wearable_address, wearableTokenId: Number(attribute.wearable_token_id)
    }));

    const extensionInterface = new ethers.Interface(AvatarContractExtensionAbi);
    const setAvatarNewWearingsEncodedFunction = extensionInterface.encodeFunctionData('setAvatarNewWearings', [Number(tokenId), wearablesToUnequip, wearablesToEquip, metadataDataValue.values[0]]);

    const txPromise = (UPContract.connect(signer) as Contract).execute(OPERATION_CALL, // operation type = CREATE
        targetContractAddress, // address zero
        0, // amount to the fund the contract with when deploying
        setAvatarNewWearingsEncodedFunction);
    const tx = await txPromise;
    await tx.wait();

    return { success: true, value: undefined };
}

export async function CheckClaimApprove(drops: ClaimableDrop[], walletAddress: string): Promise<Result<DropToClaim[]>> {
    const signaturePromises = drops.map(async (drop) => { return await SignClaimMessageFromAdmin(drop.contractAddress, walletAddress) });

    const signatures = await Promise.all(signaturePromises);

    const dropsToClaimPromises = drops.map(async (drop, index) => {
        const wearableContract = new Contract(drop.contractAddress, WearableContractABI, PROVIDER);
        const nextTokenId = Number(await wearableContract.totalSupply()) + 1;
        //TODO: Add the whole relevant flow to check each condition.
        //Temporarily passing without any checks
        return {
            wearableIndex: drop.featureIndex.toString(),
            wearableType: drop.featureType,
            wearableAddress: drop.contractAddress,
            wearablePredictedTokenId: nextTokenId.toString(),
            signature: signatures[index]
        } as DropToClaim;
    });

    const dropsToClaim = await Promise.all(dropsToClaimPromises);

    return { success: true, value: dropsToClaim };
}

export async function ClaimAndSetAvatarNewWearings(campaign: Campaign, dropsToClaim: DropToClaim[], oldAttributes: LuksoAttribute[], newAttributes: LuksoAttribute[], tokenId: string, metadataUri: string, signer: JsonRpcSigner): Promise<Result<void>> {
    try {
        const targetContractAddress = LUKSO_CAMPAIGN_WEB3_DATA[campaign].contractAddress;
        const targetContract = new Contract(targetContractAddress, AvatarContractExtensionAbi, signer);

        const UPContract = new ethers.Contract(
            signer.address as string,
            UniversalProfileABI,
            PROVIDER,
        );

        const metadataUrl = `ipfs://${metadataUri}`;
        const metadataIpfsData = await GetLuksoIPFSData(metadataUrl.split('//')[1]);

        if(!metadataIpfsData.success) {
            console.error('Error fetching metadata IPFS data:', metadataIpfsData.errMessage);
            return { success: false, errMessage: metadataIpfsData.errMessage, errCode: metadataIpfsData.errCode };
        }

        const metadataDataValue = AVATAR_ERC725_CONTRACT.encodeData([
            {
                keyName: 'LSP4Metadata',
                value: {
                    json: {'LSP4Metadata':metadataIpfsData.value},
                    url: metadataUrl,
                },
            },
        ]);

        const wearablesToUnequip = oldAttributes.map((attribute) => ({
            wearableContract: attribute.wearable_address, wearableTokenId: Number(attribute.wearable_token_id)
        }));

        const wearablesToEquip = newAttributes.map((attribute) => ({
            wearableContract: attribute.wearable_address, wearableTokenId: Number(attribute.wearable_token_id)
        }));
        const claimSignatures = dropsToClaim.map((drop) => drop.signature);
        const wearablePredictedTokenIds = dropsToClaim.map((drop) => Number(drop.wearablePredictedTokenId));

        const extensionInterface = new ethers.Interface(AvatarContractExtensionAbi);

        const setAvatarNewWearingsEncodedFunction = extensionInterface.encodeFunctionData('claimAndSetNewWearings', [Number(tokenId), claimSignatures, wearablePredictedTokenIds, wearablesToUnequip, wearablesToEquip, metadataDataValue.values[0]]);

        const claimPrice = await targetContract.getClaimPrice(wearablesToEquip);

        const txPromise = (UPContract.connect(signer) as Contract).execute(OPERATION_CALL, // operation type = CREATE
            targetContractAddress, // address zero
            Number(claimPrice), // amount to the fund the contract with when deploying
            setAvatarNewWearingsEncodedFunction);
        const tx = await txPromise;
        await tx.wait();

        return { success: true, value: undefined };
    } catch (err) {
        LogError(Module.Citizens, 'Failed to claim and set new wearings', err);
        return { success: false, errMessage: 'Failed to claim and set new wearings', errCode: CommonErrorCode.InternalError };
    }
}

export async function BurnDrop(from: string, campaign: string, drop: LuksoDrop): Promise<Result<void>> {
    const dropsData: Drop[] = await GetCollectionDocs(`campaign/${campaign}/drops`) as Drop[];
    if (!dropsData) return { success: false, errMessage: 'No drops data found', errCode: CommonErrorCode.FetchError };

    const dropPair = dropsData.find((dropData) => { return dropData.index === drop.index && dropData.type === drop.type });
    if (!dropPair) return { success: false, errMessage: 'No drop pair found', errCode: CommonErrorCode.FetchError };

    if (!EOA) return { success: false, errMessage: 'No EOA found', errCode: CommonErrorCode.FetchError };
    const dropContract = new Contract(dropPair.contract_address, OldWearableContractABI, PROVIDER);
    const burnEncondedFunction = dropContract.interface.encodeFunctionData('burn', [from, 1]);
    const tx = await (UNIVERSAL_PROFILE_CONTRACT.connect(EOA) as Contract).execute(OPERATION_CALL, // operation type = CREATE
        dropPair.contract_address,
        0, // amount to the fund the contract with when deploying
        burnEncondedFunction
    );
    await tx.wait();
    return { success: true, value: undefined };
}

export async function ClaimDrop(drop: LuksoDrop, signer: JsonRpcSigner): Promise<Result<void>> {
    const dropsData: Drop[] = await GetCollectionDocs(`campaign/${Campaign.Creators}/drops`) as Drop[];
    if (!dropsData) return { success: false, errMessage: 'No drops data found', errCode: CommonErrorCode.FetchError };

    const dropPair = dropsData.find((dropData) => { return dropData.index === drop.index && dropData.type === drop.type });
    if (!dropPair) return { success: false, errMessage: 'No drop pair found', errCode: CommonErrorCode.FetchError };

    const dropContract = new Contract(dropPair.contract_address, WearableContractABI, signer);
    const tx = await dropContract.claimWearable('0x')
    await tx.wait();
    return { success: true, value: undefined };
}

export async function GetUserWearableClaimedAmount(userAddress: string, drop:ClaimableDrop): Promise<Result<number>> {
    try {
        const wearableContract = new Contract(drop.contractAddress, WearableContractABI, PROVIDER);
        const claimedAmount = await wearableContract.getUserClaims(userAddress);
        return { success: true, value: Number(claimedAmount) };
    } catch (error) {
        void LogError(Module.LuksoUtil, `Error fetching user wearable claimed amount: ${error}`);
        return { success: false, errMessage: "Error fetching user wearable claimed amount", errCode: CommonErrorCode.FetchError };
    }
}