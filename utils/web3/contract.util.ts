import ethers, { Contract, getDefaultProvider, TransactionResponse } from 'ethers'
import AvatarContractAbi from '../../constants/abi/AvatarContractABI.json'
import { ERC725, ERC725JSONSchemaKeyType } from '@erc725/erc725.js';
import axios from 'axios';
import { TokenMetadata } from '../../types/metadata.type';

const AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL

const config = {
    ipfsGateway: 'ipfs://',
};

const provider = new ethers.JsonRpcProvider('https://rpc.lukso.gateway.fm');

const signer = new ethers.Wallet(process.env.WALLET_PK!, provider)

const address = process.env.AVATAR_CONTRACT_ADDRESS!;

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

const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY

export const mint = async (address: string, metadataIpfsUrl:string,tokenMetadata: TokenMetadata) => {
    try {
        const totalSupply = await avatarContract.totalSupply() as number
        const encodedTokenId = avatarERC725Contract.encodeValueType(
            'uint256',
            totalSupply,
        )
        const writableContract = avatarContract.connect(signer) as Contract
        const mintTx = await writableContract.mint(
            address,
            encodedTokenId,
            '0x') as TransactionResponse
        await mintTx.wait()

        const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
        const metadataDataValue = avatarERC725Contract.encodeData([
            {
                keyName: 'LSP4Metadata',
                value: {
                    json: tokenMetadata,
                    url: metadataIpfsUrl,
                },
            },
        ])
        const setDataForTokenIdTx = await writableContract.setDataForTokenId(
            encodedTokenId, metadataDataKey, metadataDataValue.values[0],)

        await setDataForTokenIdTx.wait()

        return Number(totalSupply)
    } catch (err) {
        console.log(err)
        throw err
    }

}

export const getSupply = async () => {
    if (!AVATAR_CONTRACT_ADDRESS || !RPC_URL) return
    const provider = getDefaultProvider(RPC_URL)
    const avatarContract = new Contract(AVATAR_CONTRACT_ADDRESS, AvatarContractAbi, provider)
    const totalSupply = Number(await avatarContract.totalSupply())

    return totalSupply
}