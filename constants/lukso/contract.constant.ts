import { ERC725 } from "@erc725/erc725.js";

import { ERC725JSONSchemaKeyType } from "@erc725/erc725.js";
import { JsonRpcProvider } from "ethers";
import { CampaignData } from "../../types/metadata.type";

const AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

const config = {
    ipfsGateway: 'ipfs://',
};

export const provider = new JsonRpcProvider(RPC_URL);

export const tempCampaignSwitch = { 'vrm_male': 'lukso2', 'vrm_female': 'lukso female b', 'kumi': 'kumi' };

//MAINNET
export const campaignWeb3Data: CampaignData = {
    'vrm_male': {
        contractAddress: '0x74654920356257981f6b63a65ad72d4d9bc21929',
        baseCid: 'bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju'
    }, 'vrm_female': { contractAddress: '0x754a5d007d5f1188ef0db892ee115a7c01b38fa3', baseCid: '' },
} as CampaignData;

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

export const avatarERC725Contract = new ERC725(schemas, AVATAR_CONTRACT_ADDRESS, provider, config);