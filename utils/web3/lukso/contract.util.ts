import { Contract, ethers } from 'ethers';
import AvatarContractAbi from '../../../constants/abi/AvatarContractABI.json';
import { Drop, TokenId } from '../../../interfaces/citizens.interface';
import { GetEthereumIPFSData, GetEthereumImageUrl, GetFollowStatuses, GetUniversalProfileData } from '../citizens.util';
import noMetadataTokens from '../../../constants/lukso/NoMetadataTokens.json';
import { CitizenMetadata } from '../../../interfaces/citizens.interface';
import { Result } from '../../../types/common.type';
import { LogError, ToHex64 } from '../../../utils/common.util';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { Campaign, LuksoCampaign } from '../../../enums/citizens/common.enum';
import { LUKSO_CAMPAIGN_WEB3_DATA, AVATAR_ERC725_CONTRACT, PROVIDER, TEMP_CAMPAIGN_SWITCH, UNIVERSAL_PROFILE_CONTRACT, OPERATION_CALL, EOA } from '../../../constants/lukso/contract.constant';
import { GetCollectionDocs, GetLeaderboardData } from '../../firebase.util';
import WearableContractAbi from '../../../constants/abi/WearableContractABI.json'
import { CampaignDrops } from '../../../types/citizens.type';
import { LeaderboardEntry } from '../../../types/leaderboard.type';
import { BodyPart } from '../../../interfaces/avatar.interface';
    
export async function GetTokensOf(contractAddress: string, address: string): Promise<Result<string[]>> {
    try {
        const contract = new Contract(contractAddress, AvatarContractAbi, PROVIDER);
        const tokenIdsResult: string = await contract.tokenIdsOf(address);
        const tokenIds = tokenIdsResult.toString().split(',');

        return { success: true, value: tokenIds };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.LuksoContractUtil, err.message, e);
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
        void LogError(Module.LuksoContractUtil, err.message, e);
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
        void LogError(Module.LuksoContractUtil, err.message, e);
        return {
            success: false,
            errMessage: err.message,
            errCode: ''
        };
    }
}

export async function GetEthereumTokenMetadata(tokenId: TokenId): Promise<Result<CitizenMetadata>> {
    const ipfsDataResult = await GetEthereumIPFSData(tokenId.metadataUri);
    if (!ipfsDataResult.success || !ipfsDataResult.value) return { success: false, errMessage: 'Error on getting token metadata', errCode: '' };

    const metadata = ipfsDataResult.value;
    metadata.tokenId = tokenId.tokenId;
    metadata.campaign = tokenId.campaign as Campaign;

    if (!metadata.combination) metadata.combination = Object.values(metadata.body).map(({ index }) => { return index }).join('-');
    if (!metadata.baseCombination) metadata.baseCombination = metadata.combination;
    metadata.imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${TEMP_CAMPAIGN_SWITCH[tokenId.campaign as keyof typeof TEMP_CAMPAIGN_SWITCH]}%2Favatar_images%2F${metadata.combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`;
    const imageUrlResult = GetEthereumImageUrl(metadata);
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

        const metadatasArray = [] as CitizenMetadata[];
        for (let i = 0; i < tokenIds.length; i++) {
            const tokenId = Number(tokenIds[i]).toString();
            const decodedData = decodedDataArray[i];
            const metadataUri = decodedData.value ? decodedData.value.url.split('//')[1] : `${baseCid}/${tokenId}`;
            if (!baseCid && !decodedData.value) continue;
            const tokenMetadataResult = await GetEthereumTokenMetadata({ metadataUri, campaign, tokenId });
            if (tokenMetadataResult.success) metadatasArray.push(tokenMetadataResult.value);
        }

        return { success: true, value: metadatasArray };
    } catch (e) {
        const err = e as Error;
        void LogError(Module.LuksoContractUtil, err.message, e);
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

export async function GetCampaignsTokensMetadata(address: string): Promise<Result<CitizenMetadata[]>> { //Fix error handling!!
    let campaignsMetadatas: CitizenMetadata[] = [];
    let hasErrors = false;
    for (const campaign of Object.keys(LUKSO_CAMPAIGN_WEB3_DATA)) {
        const tokensMetadataResult = await GetCampaignTokensMetadata(campaign as Campaign, address);
        if (!tokensMetadataResult.success) {
            hasErrors = true;
            continue;
        }
        campaignsMetadatas = campaignsMetadatas.concat(tokensMetadataResult.value);
    }
    if (hasErrors && campaignsMetadatas.length === 0) return { success: false, errMessage: 'No tokens metadata were loaded correctly', errCode: CommonErrorCode.FetchError };
    return { success: true, value: campaignsMetadatas };
}

export async function GetCampaignUserFeatures(address: string, campaign: string): Promise<Result<Drop[]>> {
    try {
        const dropsData: Drop[] = await GetCollectionDocs(`campaign/${campaign}/drops`) as Drop[];
        
        const balancePromises = dropsData.map(drop => {
            const contract = new Contract(drop.contract_address, WearableContractAbi, PROVIDER);
            return contract.balanceOf(address).then(balance => ({
                drop,
                balance: Number(balance)
            }));
        });

        const results = await Promise.all(balancePromises);

        const features = results
            .filter(({ balance }) => balance > 0)
            .map(({ drop, balance }) => ({
                ...drop,
                balance
            }));

        return { success: true, value: features };
    } catch (error) {
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
    const leaderboardData = await GetLeaderboardData();
    const leaderboardWithProfileData = await Promise.all(leaderboardData.map(async (entry: LeaderboardEntry) => {
        const profileData = await GetUniversalProfileData(entry.address);
        if (!profileData.success) return entry; // If the profile data is not found, return the original entry
        return {
          ...entry,
          name: profileData.value.name,
          profileImage: profileData.value.profileImage,
          isFollowing: false
        };
      }));

      if(!leaderboardWithProfileData) return { success: false, errMessage: 'Error getting leaderboard with profile data', errCode: CommonErrorCode.FetchError };

      const followStatuses = await GetFollowStatuses(leaderboardWithProfileData, PROVIDER, walletAddress as string);
      leaderboardWithProfileData.forEach(entry => {
        entry.isFollowing = followStatuses[entry.address] || false;
      });
    return { success: true, value: leaderboardWithProfileData };
}

export async function SetTokenMetadata(campaign: Campaign, tokenId: string, metadataUri: string): Promise<Result<void>> {
    const targetContractAddress = LUKSO_CAMPAIGN_WEB3_DATA[campaign].contractAddress;
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        AvatarContractAbi,
        PROVIDER,
    );

    const metadataUrl = `ipfs://${metadataUri}`;
    const metadataIpfsData = await GetEthereumIPFSData(metadataUrl.split('//')[1]);
    const metadataDataKey = AVATAR_ERC725_CONTRACT.encodeKeyName('LSP4Metadata');
    const metadataDataValue = AVATAR_ERC725_CONTRACT.encodeData([
        {
            keyName: 'LSP4Metadata',
            value: {
                json: metadataIpfsData,
                url: metadataUrl,
            },
        },
    ]);
    const setMetadataDataEncodedFunction = avatarContract.interface.encodeFunctionData('setDataForTokenId', [ToHex64(Number(tokenId)), metadataDataKey, metadataDataValue.values[0]]);
    const tx = await (UNIVERSAL_PROFILE_CONTRACT.connect(EOA) as Contract).execute(OPERATION_CALL, // operation type = CREATE
        targetContractAddress, // address zero
        0, // amount to the fund the contract with when deploying
        setMetadataDataEncodedFunction
    );
    await tx.wait();
    return { success: true, value: undefined };
}

export async function BurnDrop(from: string, campaign: string, drop: BodyPart): Promise<Result<void>> {
    const dropsData: Drop[] = await GetCollectionDocs(`campaign/${campaign}/drops`) as Drop[];
    if (!dropsData) return { success: false, errMessage: 'No drops data found', errCode: CommonErrorCode.FetchError };

    const dropPair = dropsData.find((dropData) => { return dropData.name === drop.name });
    if (!dropPair) return { success: false, errMessage: 'No drop pair found', errCode: CommonErrorCode.FetchError };

    const dropContract = new Contract(dropPair.contract_address, WearableContractAbi, PROVIDER);
    const burnEncondedFunction = dropContract.interface.encodeFunctionData('burn', [from, 1]);
    const tx = await (UNIVERSAL_PROFILE_CONTRACT.connect(EOA) as Contract).execute(OPERATION_CALL, // operation type = CREATE
        dropPair.contract_address,
        0, // amount to the fund the contract with when deploying
        burnEncondedFunction
    );
    await tx.wait();
    return { success: true, value: undefined };
}