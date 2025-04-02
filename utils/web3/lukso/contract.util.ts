import { Contract } from 'ethers';
import AvatarContractAbi from '../../../constants/abi/AvatarContractABI.json';
import { TokenId } from '../../../types/metadata.type';
import { GetEthereumIPFSData, GetEthereumImageUrl } from '../lukso.util';
import noMetadataTokens from '../../../constants/lukso/NoMetadataTokens.json';
import { CitizenMetadata } from '../../../interfaces/citizens.interface';
import { Result } from '../../../types/common.type';
import { LogError } from '../../../utils/common.util';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { Campaign } from '../../../enums/citizens/common.enum';
import { campaignWeb3Data, avatarERC725Contract, provider, tempCampaignSwitch } from '../../../constants/lukso/contract.constant';

export async function GetTokensOf(contractAddress: string, address: string): Promise<Result<string[]>> {
    try {
        const contract = new Contract(contractAddress, AvatarContractAbi, provider);
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

        for (const campaign of Object.keys(campaignWeb3Data).filter((campaign) => campaign)) {
            const typpedCampaign = campaign as keyof typeof campaignWeb3Data;
            const { contractAddress } = campaignWeb3Data[typpedCampaign];

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
        const { contractAddress } = campaignWeb3Data[campaign];
        const contract = new Contract(contractAddress, AvatarContractAbi, provider);
        const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata');
        const metadataKeyArray = tokenIds.map(() => metadataDataKey);

        const getDataBatchForTokenIdsTx = await contract.getDataBatchForTokenIds(
            tokenIds,
            metadataKeyArray
        );

        const metadataFormattedArray = getDataBatchForTokenIdsTx.map((rawData: string) => {
            return { keyName: metadataDataKey, value: rawData };
        });

        const decodedRawData = avatarERC725Contract.decodeData(metadataFormattedArray);
        const decodedDataArray = JSON.parse(JSON.stringify(decodedRawData));

        const { baseCid } = campaignWeb3Data[campaign];
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
    if (!ipfsDataResult.success) return { success: false, errMessage: ipfsDataResult.errMessage, errCode: ipfsDataResult.errCode };

    const metadata = ipfsDataResult.value;
    metadata.tokenId = tokenId.tokenId;
    metadata.campaign = tokenId.campaign as Campaign;

    if (!metadata.combination) metadata.combination = Object.values(metadata.body).map(({ index }) => { return index }).join('-');
    if (!metadata.baseCombination) metadata.baseCombination = metadata.combination;
    metadata.imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${tempCampaignSwitch[tokenId.campaign as keyof typeof tempCampaignSwitch]}%2Favatar_images%2F${metadata.combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`;
    const imageUrlResult = GetEthereumImageUrl(metadata);
    if (imageUrlResult.success) metadata.fallbackImageUrl = imageUrlResult.value; // There could be some cases where the image url is not valid

    return { success: true, value: metadata };
}

export async function GetTokensMetadata(campaign: Campaign, tokenIds: string[]): Promise<Result<CitizenMetadata[]>> {
    const { contractAddress, baseCid } = campaignWeb3Data[campaign];
    try {
        const contract = new Contract(contractAddress, AvatarContractAbi, provider);
        const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata');
        const metadataKeyArray = tokenIds.map(() => metadataDataKey);
        const getDataBatchForTokenIdsTx = await contract.getDataBatchForTokenIds(
            tokenIds,
            metadataKeyArray
        );
        const metadataFormattedArray = getDataBatchForTokenIdsTx.map((rawData: string) => {
            return { keyName: metadataDataKey, value: rawData };
        });
        const decodedRawData = avatarERC725Contract.decodeData(metadataFormattedArray);
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

export async function GetCampaignsTokensMetadata(address: string): Promise<Result<CitizenMetadata[]>> {
    let campaignsMetadatas = [] as CitizenMetadata[];
    for (const campaign of Object.keys(campaignWeb3Data)) {
        const typpedCampaign = campaign as keyof typeof campaignWeb3Data;
        const { contractAddress } = campaignWeb3Data[typpedCampaign];
        const tokenIds = await GetCampaignTokenIds(contractAddress, address);
        if (!tokenIds.success) continue;
        const tokensMetadataResult = await GetTokensMetadata(typpedCampaign as Campaign, tokenIds.value);
        if (!tokensMetadataResult.success) continue;
        campaignsMetadatas = campaignsMetadatas.concat(tokensMetadataResult.value);
    }
    return { success: true, value: campaignsMetadatas };
}