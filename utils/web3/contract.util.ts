import { Contract, ethers, JsonRpcProvider, Signer, TransactionResponse } from 'ethers'
import AvatarContractAbi from '../../constants/abi/AvatarContractABI.json'
import ProxyContractAbi from '../../constants/abi/AvatarProxyContractABI.json'
import WerableContractAbi from '../../constants/abi/WearableContractABI.json'
import { ERC725, ERC725JSONSchemaKeyType } from '@erc725/erc725.js';
import { Campaign, CampaignData, CampaignDrops, Drop, TokenId, TokenMetadata } from '../../types/metadata.type';
import { getIPFSData, getImageUrl } from './lukso.util';
import { GetCollectionDocs, GetDropsContractAddresses } from '../firebase.util';
import noMetadataTokens from '../../constants/lukso/NoMetadataTokens.json'
import UniversalProfileABI from '../../constants/abi/UniversalProfileABI.json'
import { BodyPart } from '../../types/avatar.type';


const AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS!
const AVATAR_PROXY_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_PROXY_ADDRESS!
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL
const UNIVERSAL_PROFILE_ADDRESS = process.env.NEXT_PUBLIC_PROFILE_ADDRESS;
const PK = process.env.NEXT_PUBLIC_PK!

const config = {
    ipfsGateway: 'ipfs://',
};

const provider = new JsonRpcProvider(RPC_URL);

const universalProfile = new ethers.Contract(
    UNIVERSAL_PROFILE_ADDRESS as string,
    UniversalProfileABI,
    provider,
);

const EOA = new ethers.Wallet(PK).connect(provider);

const OPERATION_CALL = 0;

export const tempCampaignSwitch = { 'vrm_male': 'lukso2', 'vrm_female': 'lukso female b' }

//TESTNET

/* const campaignWeb3Data: CampaignData = {
    'vrm_male': {
        contractAddress: '0xeCf25fd57557c363EDA7C3eA01c58C55b631e7C2',
        baseCid: 'bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju'
    }, 'vrm_female': { contractAddress: '0x0b0cA7fD6931e0Ecb83ADcee8BC85aA5c1BaaE87', baseCid: '' },
} */

//MAINNET

const campaignWeb3Data: CampaignData = {
    'vrm_male': {
        contractAddress: '0x74654920356257981f6b63a65ad72d4d9bc21929',
        baseCid: 'bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju'
    }, 'vrm_female': { contractAddress: '0x754a5d007d5f1188ef0db892ee115a7c01b38fa3', baseCid: '' },
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

function ToHex64(num: number) {
    let hex = num.toString(16);

    hex = hex.padStart(64, '0');

    return '0x' + hex;
}


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

export const getCampaignsTokenIds = async (address: string) => {
    let campaignsTokenIds = [] as TokenId[]
    for (const campaign of Object.keys(campaignWeb3Data)) {
        const typpedCampaign = campaign as keyof typeof campaignWeb3Data
        const { contractAddress } = campaignWeb3Data[typpedCampaign]
        let tokenIds: string[] = await getCampaignTokenIds(contractAddress, address)

        if (campaign === 'vrm_female') tokenIds = tokenIds.filter((tokenId) => !noMetadataTokens.includes(Number(tokenId)))

        if (!tokenIds || tokenIds.length == 0) continue

        const tokensMetadataUrls = await getCampaignTokenMetadataUris(campaign as Campaign, tokenIds)
        const formattedTokenIds = tokenIds.map((tokenId, index) => {
            const metadataUri = tokensMetadataUrls[index]
            return { tokenId: Number(tokenId).toString(), campaign, metadataUri } as TokenId
        })
        campaignsTokenIds = campaignsTokenIds.concat(formattedTokenIds)
    }
    return campaignsTokenIds
    
    /* [
        {
            "tokenId": "2614",
            "campaign": "vrm_male",
            "metadataUri": "QmedjZydgFG93XHAyK1MmbuuXSm2Jgs9Nh5nMZPVaQJDWY"
        },
        {
            "tokenId": "2615",
            "campaign": "vrm_male",
            "metadataUri": "QmTAEcNBkhYfFLP2uQyVGNdyTDVBoTKTpqCpat4rKFm2DF"},
    ] */
}



export const getCampaignTokenMetadataUris = async (campaign: Campaign, tokenIds: string[]) => {
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
    const formattedDataArray = decodedDataArray.map((data: { value: { url: string }; }, index: number) => {
        const { value: metadataUri } = data
        const { baseCid } = campaignWeb3Data[campaign]
        return metadataUri ? metadataUri.url.split('//')[1] : `${baseCid}/${Number(tokenIds[index])}`
    })

    return formattedDataArray
}



export const getTokenMetadata = async (tokenId: TokenId) => {
    const { LSP4Metadata: metadata } = await getIPFSData(tokenId.metadataUri)
    metadata.tokenId = tokenId.tokenId
    metadata.campaign = tokenId.campaign

    if (!metadata.combination) metadata.combination = Object.values(metadata.body).map(({ index }) => { return index }).join('-')
    if (!metadata.baseCombination) metadata.baseCombination = metadata.combination
    metadata.imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${tempCampaignSwitch[tokenId.campaign as keyof typeof tempCampaignSwitch]}%2Favatar_images%2F${metadata.combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`
    metadata.fallbackImageUrl = getImageUrl(metadata)

    return metadata
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
            const tokenId = Number(tokenIds[i]).toString()
            const decodedData = decodedDataArray[i]
            const metadataUri = decodedData.value ? decodedData.value.url.split('//')[1] : `${baseCid}/${tokenId}`
            if (!baseCid && !decodedData.value) continue
            const tokenMetadata = await getTokenMetadata({ metadataUri, campaign, tokenId })
            metadatasArray.push(tokenMetadata)
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

    if (tokenIds[0] === "") return []

    return tokenIds
}

export const getCampaignUserFeatures = async (address: string, campaign: string) => {
    const dropsData: Drop[] = await GetCollectionDocs(`campaign/${campaign}/drops`) as Drop[]
    const features: Drop[] = []
    for (let i = 0; i < dropsData.length; i++) {
        const drop = dropsData[i];
        const { contract_address } = drop

        const contract = new Contract(contract_address, WerableContractAbi, provider)
        const tokenBalance = await contract.balanceOf(address)
        if (Number(tokenBalance) > 0) features.push(drop)
    }
    return features
}


export const getUserFeatures = async (address: string) => {
    const features: CampaignDrops = {
        vrm_male: [],
        vrm_female: []
    }
    for (const campaign of Object.keys(campaignWeb3Data)) {
        const campaignUserFeatures = await getCampaignUserFeatures(address, campaign)
        features[campaign as keyof typeof campaignWeb3Data] = campaignUserFeatures
    }
    return features
}

export const setTokenMetadata = async (campaign: Campaign, tokenId: string, tokenMetadata: TokenMetadata, metadataUrl: string) => {
    const targetContractAddress = campaignWeb3Data[campaign].contractAddress
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        AvatarContractAbi,
        provider,
    );

    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
    const metadataDataValue = avatarERC725Contract.encodeData([
        {
            keyName: 'LSP4Metadata',
            value: {
                json: { "LSP4Metadata": tokenMetadata },
                url: metadataUrl,
            },
        },
    ])
    const setMetadataDataEncodedFunction = avatarContract.interface.encodeFunctionData('setDataForTokenId', [ToHex64(Number(tokenId)), metadataDataKey, metadataDataValue.values[0]])
    const tx = await (universalProfile.connect(EOA) as Contract).execute(OPERATION_CALL, // operation type = CREATE
        targetContractAddress, // address zero
        0, // amount to the fund the contract with when deploying
        setMetadataDataEncodedFunction
    )
    tx.wait()
}

export const burnDrop = async (from: string, campaign: string, drop: BodyPart) => {
    const dropsData: Drop[] = await GetCollectionDocs(`campaign/${campaign}/drops`) as Drop[]
    if (!dropsData) return

    const dropPair = dropsData.find((dropData) => { return dropData.name === drop.name })
console.log(dropPair,drop.name, dropsData,"DROP PAIR")
    if (!dropPair) return

    const dropContract = new Contract(dropPair.contract_address, WerableContractAbi, provider)
    console.log(dropPair.contract_address)
    const burnEncondedFunction = dropContract.interface.encodeFunctionData('burn', [from, 1])
    const tx = await (universalProfile.connect(EOA) as Contract).execute(OPERATION_CALL, // operation type = CREATE
        dropPair.contract_address,
        0, // amount to the fund the contract with when deploying
        burnEncondedFunction
    )
    tx.wait()
}

export async function GetCitizensHoldings(address: string): Promise<number> {
  let total = 0;
  for (const campaign of Object.keys(campaignWeb3Data)) {
    const { contractAddress } = campaignWeb3Data[campaign as keyof typeof campaignWeb3Data];
    const contract = new Contract(contractAddress, AvatarContractAbi, provider);
    const balance = await contract.balanceOf(address);
    total += Number(balance);
  }
  return total;
}

export async function GetWearablesHoldings(address: string): Promise<number> {
  const contractAddresses = await GetDropsContractAddresses();
  
  let total = 0;
  for (const contractAddress of contractAddresses) {
    const contract = new Contract(contractAddress, WerableContractAbi, provider);
    const balance = await contract.balanceOf(address);
    total += Number(balance);
  }
  return total;
}
