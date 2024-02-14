import { Contract, JsonRpcProvider, TransactionResponse, Wallet } from 'ethers'
import AvatarContractAbi from '../../constants/abi/AvatarContractABI.json'
import { ERC725, ERC725JSONSchemaKeyType } from '@erc725/erc725.js';
import { TokenMetadata } from '../../types/metadata.type';
import { getIPFSData } from './lukso.util';
import { DecodeDataInput } from '@erc725/erc725.js/build/main/src/types/decodeData';

const AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL

const config = {
    ipfsGateway: 'ipfs://',
};

const provider = new JsonRpcProvider(RPC_URL);

const signer = new Wallet(process.env.NEXT_PUBLIC_WALLET_PK!, provider)

const address = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS!;

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


const avatarERC725Contract = new ERC725(schemas, address, provider, config);
const avatarContract = new Contract(address, AvatarContractAbi, provider)

export const mint = async (address: string, metadataIpfsUrl: string, tokenMetadata: TokenMetadata) => {
/*      if(await getTokensMetadata(address)) {
        console.log("User has minted")
        return}
    const totalSupply = await avatarContract.totalSupply() as number */
    const encodedTokenId = '0x000000000000000000000000000000000000000000000000000000000000000f'/*
    console.log(address, metadataIpfsUrl, tokenMetadata) */
    const writableContract = avatarContract.connect(signer) as Contract
/*     const mintTx = await writableContract.mint(
        address,
        encodedTokenId,
        '0x') as TransactionResponse
    await mintTx.wait() */

    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
    const metadataDataValue = avatarERC725Contract.encodeData([
        {
            keyName: 'LSP4Metadata',
            value: {
                json: { 'LSP4Metadata': tokenMetadata },
                url: `ipfs://${metadataIpfsUrl}`,
            },
        },
    ])
    const setDataForTokenIdTx = await writableContract.setDataForTokenId(
        encodedTokenId, metadataDataKey, metadataDataValue.values[0],) as TransactionResponse

    await setDataForTokenIdTx.wait()

    return encodedTokenId


}

export const getTokensMetadata = async (address: string) => {
    const tokenIds = await avatarContract.tokenIdsOf(address) as Array<string>

    if (tokenIds.length == 0) return undefined

    const tokenId = tokenIds[0]
    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
    const getDataForTokenIdTx = await avatarContract.getDataForTokenId(
        tokenId,
        metadataDataKey
    ) as DecodeDataInput['value']
    const decodedData = avatarERC725Contract.decodeData([{ keyName: metadataDataKey, value: getDataForTokenIdTx }]) as Array<{ value: { url: string } }>
    if (!decodedData) return undefined
    const metadataUri = decodedData[0].value.url.split('//')[1]
    const tokenMetadata = await getIPFSData(metadataUri)

    return tokenMetadata['LSP4Metadata']

}

export const getSupply = async () => {
    if (!AVATAR_CONTRACT_ADDRESS || !RPC_URL) return
    const avatarContract = new Contract(AVATAR_CONTRACT_ADDRESS, AvatarContractAbi, provider)
    const totalSupply = Number(await avatarContract.totalSupply())

    return totalSupply
}