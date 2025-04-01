import { Contract, JsonRpcProvider } from 'ethers'
import AvatarContractAbi from '../../../constants/abi/AvatarContractABI.json'
import ProxyContractAbi from '../../../constants/abi/AvatarProxyContractABI.json'
import { ERC725, ERC725JSONSchemaKeyType } from '@erc725/erc725.js';
import { CampaignData, TokenId } from '../../../types/metadata.type';
import { getEthereumIPFSData, getEthereumImageUrl } from '../lukso.util';
import noMetadataTokens from '../../../constants/lukso/NoMetadataTokens.json'
import { CitizenMetadata } from '../../../interfaces/citizens.interface';
import { Result } from '../../../types/common.type'
import { LogError } from '../../../utils/common.util'
import { CommonErrorCode, Module } from '../../../enums/common.enum'
import { Campaign } from '../../../enums/citizens/common.enum';

/* TODO: 
- Check and correct campaign types */

const AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS!
const AVATAR_PROXY_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_PROXY_ADDRESS!
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL

const config = {
    ipfsGateway: 'ipfs://',
};

const provider = new JsonRpcProvider(RPC_URL);

export const tempCampaignSwitch = { 'vrm_male': 'lukso2', 'vrm_female': 'lukso female b', 'kumi': 'kumi' }

//MAINNET

const campaignWeb3Data: CampaignData = {
    'vrm_male': {
        contractAddress: '0x74654920356257981f6b63a65ad72d4d9bc21929',
        baseCid: 'bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju'
    }, 'vrm_female': { contractAddress: '0x754a5d007d5f1188ef0db892ee115a7c01b38fa3', baseCid: '' },
} as CampaignData

const schemas = [
    {
        name: 'LSP8MetadataTokenURI:bytes',
        key: '0x1339e76a390b7b9ec9010000b963e9b45d014edd60cff22ec9ad383335bbc3f8',
        keyType: 'Mapping' as ERC725JSONSchemaKeyType,
        valueType: 'bytes',
        valueContent: '0xabe425d6',
    },
    {
        name: "LSP4Metadata",
        key: "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
        keyType: "Singleton" as ERC725JSONSchemaKeyType,
        valueType: "bytes",
        valueContent: "VerifiableURI"
    }
];


const avatarERC725Contract = new ERC725(schemas, AVATAR_CONTRACT_ADDRESS, provider, config);

export async function getTokensOf(contractAddress: string, address: string): Promise<Result<string[]>> {
    try {
        const contract = new Contract(contractAddress, AvatarContractAbi, provider)
        const tokenIdsResult: string = await contract.tokenIdsOf(address)
        const tokenIds = tokenIdsResult.toString().split(',')

        return { success: true, value: tokenIds }
    } catch (e) {
        const err = e as Error
        void LogError(Module.LuksoContractUtil, err.message, e)
        return {
            success: false,
            errMessage: err.message,
            errCode: CommonErrorCode.FetchError
        }
    }
}

export async function getCampaignTokenIds(campaignAddress: string, address: string): Promise<Result<string[]>> {
    const tokenIdsResult = await getTokensOf(campaignAddress, address)
    if (!tokenIdsResult.success) return { success: false, errMessage: tokenIdsResult.errMessage, errCode: tokenIdsResult.errCode }

    return { success: true, value: tokenIdsResult.value }

}

export async function getEthereumCampaignsTokenIds(address: string): Promise<Result<TokenId[]>> {
    try {
        let campaignsTokenIds = [] as TokenId[]

        for (const campaign of Object.keys(campaignWeb3Data).filter((campaign) => campaign)) {
            const typpedCampaign = campaign as keyof typeof campaignWeb3Data
            const { contractAddress } = campaignWeb3Data[typpedCampaign]

            const tokenIdsResult = await getCampaignTokenIds(contractAddress, address)
            if (!tokenIdsResult.success) continue

            let tokenIds = tokenIdsResult.value
            if (campaign === 'vrm_female') {
                tokenIds = tokenIds.filter((tokenId) => !noMetadataTokens.includes(Number(tokenId)))
            }

            if (!tokenIds || tokenIds.length == 0) continue

            const tokensMetadataUrls = await getCampaignTokenMetadataUris(campaign as Campaign, tokenIds)
            if (!tokensMetadataUrls.success) continue

            const formattedTokenIds = tokenIds.map((tokenId, index) => {
                const metadataUri = tokensMetadataUrls.value[index]
                return {
                    tokenId: Number(tokenId).toString(),
                    campaign,
                    metadataUri
                } as TokenId
            })

            campaignsTokenIds = campaignsTokenIds.concat(formattedTokenIds)
        }

        return { success: true, value: campaignsTokenIds }
    } catch (e) {
        const err = e as Error
        void LogError(Module.LuksoContractUtil, err.message, e)
        return {
            success: false,
            errMessage: err.message,
            errCode: ''
        }
    }
}

export async function getCampaignTokenMetadataUris(campaign: Campaign, tokenIds: string[]): Promise<Result<string[]>> {
    try {
        const { contractAddress } = campaignWeb3Data[campaign]
        const contract = new Contract(contractAddress, AvatarContractAbi, provider)
        const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
        const metadataKeyArray = tokenIds.map(() => metadataDataKey)

        const getDataBatchForTokenIdsTx = await contract.getDataBatchForTokenIds(
            tokenIds,
            metadataKeyArray
        )

        const metadataFormattedArray = getDataBatchForTokenIdsTx.map((rawData: string) => {
            return { keyName: metadataDataKey, value: rawData }
        })

        const decodedRawData = avatarERC725Contract.decodeData(metadataFormattedArray)
        const decodedDataArray = JSON.parse(JSON.stringify(decodedRawData))

        const { baseCid } = campaignWeb3Data[campaign]
        const formattedDataArray = decodedDataArray.map((data: { value: { url: string }; }, index: number) => {
            const { value: metadataUri } = data
            return metadataUri ? metadataUri.url.split('//')[1] : `${baseCid}/${Number(tokenIds[index])}`
        })

        return { success: true, value: formattedDataArray }
    } catch (e) {
        const err = e as Error
        void LogError(Module.LuksoContractUtil, err.message, e)
        return {
            success: false,
            errMessage: err.message,
            errCode: ''
        }
    }
}

export async function getEthereumTokenMetadata(tokenId: TokenId): Promise<Result<CitizenMetadata>> {
    const ipfsDataResult = await getEthereumIPFSData(tokenId.metadataUri)
    if (!ipfsDataResult.success) return { success: false, errMessage: ipfsDataResult.errMessage, errCode: ipfsDataResult.errCode }

    const metadata = ipfsDataResult.value
    metadata.tokenId = tokenId.tokenId
    metadata.campaign = tokenId.campaign as Campaign

    if (!metadata.combination) metadata.combination = Object.values(metadata.body).map(({ index }) => { return index }).join('-')
    if (!metadata.baseCombination) metadata.baseCombination = metadata.combination
    metadata.imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${tempCampaignSwitch[tokenId.campaign as keyof typeof tempCampaignSwitch]}%2Favatar_images%2F${metadata.combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`
    metadata.fallbackImageUrl = getEthereumImageUrl(metadata)

    return { success: true, value: metadata }
}

export async function getTokensMetadata(campaign: Campaign, tokenIds: string[]): Promise<Result<CitizenMetadata[]>> {
    const { contractAddress, baseCid } = campaignWeb3Data[campaign]
    try {
        const contract = new Contract(contractAddress, AvatarContractAbi, provider)
        const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
        const metadataKeyArray = tokenIds.map(() => metadataDataKey)
    const getDataBatchForTokenIdsTx = await contract.getDataBatchForTokenIds(
        tokenIds,
        metadataKeyArray
    )
    const metadataFormattedArray = getDataBatchForTokenIdsTx.map((rawData: string) => {
        return { keyName: metadataDataKey, value: rawData }
    })
    const decodedRawData = avatarERC725Contract.decodeData(metadataFormattedArray)
    const decodedDataArray = JSON.parse(JSON.stringify(decodedRawData))

    const metadatasArray = [] as CitizenMetadata[]
    for (let i = 0; i < tokenIds.length; i++) {
            const tokenId = Number(tokenIds[i]).toString()
            const decodedData = decodedDataArray[i]
            const metadataUri = decodedData.value ? decodedData.value.url.split('//')[1] : `${baseCid}/${tokenId}`
            if (!baseCid && !decodedData.value) continue
            const tokenMetadataResult = await getEthereumTokenMetadata({ metadataUri, campaign, tokenId })
            if (tokenMetadataResult.success) metadatasArray.push(tokenMetadataResult.value)
    }

        return { success: true, value: metadatasArray }
    } catch (e) {
        const err = e as Error
        void LogError(Module.LuksoContractUtil, err.message, e)
        return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError }
    }
}

export async function getCampaignsTokensMetadata(address: string): Promise<Result<CitizenMetadata[]>> {
    let campaignsMetadatas = [] as CitizenMetadata[]
    for (const campaign of Object.keys(campaignWeb3Data)) {
        const typpedCampaign = campaign as keyof typeof campaignWeb3Data
        const { contractAddress } = campaignWeb3Data[typpedCampaign]
        const tokenIds = await getCampaignTokenIds(contractAddress, address)
        if (!tokenIds.success) continue
        const tokensMetadataResult = await getTokensMetadata(typpedCampaign as Campaign, tokenIds.value)
        if (!tokensMetadataResult.success) continue
        campaignsMetadatas = campaignsMetadatas.concat(tokensMetadataResult.value)
    }
    return { success: true, value: campaignsMetadatas }
}





