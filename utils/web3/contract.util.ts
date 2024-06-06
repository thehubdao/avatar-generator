import { Contract, JsonRpcProvider, Signer, TransactionResponse } from 'ethers'
import AvatarContractAbi from '../../constants/abi/AvatarContractABI.json'
import ProxyContractAbi from '../../constants/abi/AvatarProxyContractABI.json'
import { ERC725, ERC725JSONSchemaKeyType } from '@erc725/erc725.js';
import { Campaign, CampaignData, TokenMetadata } from '../../types/metadata.type';
import { getIPFSData, getImageUrl } from './lukso.util';

const AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS!
const AVATAR_PROXY_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_PROXY_ADDRESS!
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL

const config = {
    ipfsGateway: 'ipfs://',
};

const provider = new JsonRpcProvider(RPC_URL);

//TESTNET

/* const campaignWeb3Data: CampaignData = {
    'lukso2': {
        contractAddress: '0xeCf25fd57557c363EDA7C3eA01c58C55b631e7C2',
        baseCid: 'bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju'
    }, 'lukso female b': { contractAddress: '0x0b0cA7fD6931e0Ecb83ADcee8BC85aA5c1BaaE87', baseCid: '' },
} */

//MAINNET

const campaignWeb3Data: CampaignData = {
    'lukso2': {
        contractAddress: '0x74654920356257981f6b63a65ad72d4d9bc21929',
        baseCid: 'bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju'
    }, 'lukso female b': { contractAddress: '0x754a5d007d5f1188ef0db892ee115a7c01b38fa3', baseCid: '' },
}

const schemas = [
    {
        name: 'LSP8MetadataTokenURI:bytes',
        key: '0x1339e76a390b7b9ec9010000b963e9b45d014edd60cff22ec9ad383335bbc3f8',
        keyType: 'Mapping' as ERC725JSONSchemaKeyType,
        valueType: 'bytes',
        valueContent: '0xabe425d6',
    },
    {
        "name": "LSP4Metadata",
        "key": "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
        "keyType": "Singleton" as ERC725JSONSchemaKeyType,
        "valueType": "bytes",
        "valueContent": "VerifiableURI"
    }
];


const avatarERC725Contract = new ERC725(schemas, AVATAR_CONTRACT_ADDRESS, provider, config);
const avatarContract = new Contract(AVATAR_CONTRACT_ADDRESS, AvatarContractAbi, provider)
const proxyContract = new Contract(AVATAR_PROXY_ADDRESS, ProxyContractAbi, provider)


export const mint = async (metadataIpfsUrl: string, tokenMetadata: TokenMetadata, walletSigner: Signer) => {
    const writableProxyContract = proxyContract.connect(walletSigner) as Contract
    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
    const metadataDataValue = avatarERC725Contract.encodeData([
        {
            keyName: 'LSP4Metadata',
            value: {
                json: { 'LSP4Metadata': tokenMetadata },
                url: `ipfs://${metadataIpfsUrl}`,
            },
        },
    ])/*  */
    const mintTx = await writableProxyContract.mint('0x', metadataDataKey, metadataDataValue.values[0],
    ) as TransactionResponse
    await mintTx.wait();

    const address = await walletSigner.getAddress()
    const tokenIds = await avatarContract.tokenIdsOf(address) as Array<string>
    const encodedTokenId = avatarERC725Contract.encodeValueType(
        'uint256',
        tokenIds[0],
    )
    return encodedTokenId


}

export const totalSupply = async () => { return Number(await avatarContract.totalSupply()) }

export const isWhitelisted = async (address: string) => {
    const isWhitelisted = await proxyContract.isWhitelisted(address) as boolean
    return isWhitelisted
}

export const getCampaignTokenIds = async (campaignAddress: string, address: string) => {
    const campaignTokenIds = await getTokensOf(campaignAddress, address)
    return campaignTokenIds
}

export const getTokensMetadata = async (campaign: Campaign, tokenIds: string[]) => {
    const { contractAddress, baseCid } = campaignWeb3Data[campaign]
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

    const metadatasArray = []
    for (let i = 0; i < tokenIds.length; i++) {
        try {
            const tokenId = Number(tokenIds[i])
            const decodedData = decodedDataArray[i]
            const metadataUri = decodedData.value ? decodedData.value.url.split('//')[1] : `${baseCid}/${tokenId}`
            if (!baseCid && !decodedData.value) continue
            const { LSP4Metadata: metadata } = await getIPFSData(metadataUri)
            metadata.tokenId = tokenId
            metadata.campaign = campaign
            if (!metadata.combination) metadata.combination = Object.values(metadata.body).map(({ index }) => { return index }).join('-')

            metadata.imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${campaign}%2Favatar_images%2F${metadata.combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`
            metadata.fallbackImageUrl = getImageUrl(metadata) 
            metadatasArray.push(metadata)
        } catch (err) { console.log(err) }
    }

    return metadatasArray
}

export const getCampaignsTokensMetadata = async (address: string) => {
    let campaignsMetadatas = [] as TokenMetadata[]
    for (const campaign of Object.keys(campaignWeb3Data)) {
        const typpedCampaign = campaign as keyof typeof campaignWeb3Data
        const { contractAddress } = campaignWeb3Data[typpedCampaign]
        const tokenIds: string[] = await getCampaignTokenIds(contractAddress, address)
        if (!tokenIds) continue
        const tokensMetadata = await getTokensMetadata(typpedCampaign, tokenIds)
        campaignsMetadatas = campaignsMetadatas.concat(tokensMetadata)
    }
    return campaignsMetadatas
}

export const getSupply = async () => {
    if (!AVATAR_CONTRACT_ADDRESS || !RPC_URL) return
    const avatarContract = new Contract(AVATAR_CONTRACT_ADDRESS, AvatarContractAbi, provider)
    const totalSupply = Number(await avatarContract.totalSupply())

    return totalSupply
}

export const getTokensOf = async (contractAddress: string, address: string) => {
    const contract = new Contract(contractAddress, AvatarContractAbi, provider)
    const tokenIdsResult: string = await contract.tokenIdsOf(address)

    const tokenIds = tokenIdsResult.toString().split(',')

    if (tokenIds.length == 0) return []

    return tokenIds
}

export const getUserFeatures = async (contractAddress: string, address: string) => {
    const contract = new Contract(contractAddress, AvatarContractAbi, provider)
    const tokenIdsResult = await contract.tokenIdsOf(address)
    const tokenIds = JSON.parse(JSON.stringify(tokenIdsResult))
    if (tokenIds.length == 0) return

    return tokenIds
}

