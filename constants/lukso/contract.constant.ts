import { ERC725 } from "@erc725/erc725.js";
import { ERC725JSONSchemaKeyType } from "@erc725/erc725.js";
import { ethers, JsonRpcProvider, Wallet } from "ethers";
import UniversalProfileABI from '../../constants/abi/UniversalProfileABI.json'
import { ThrowError } from "../../utils/common.util";
import { CampaignConstant } from "../campaign.constant";

const AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS || ThrowError('NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS is required');
const UNIVERSAL_PROFILE_ADDRESS = process.env.NEXT_PUBLIC_PROFILE_ADDRESS || ThrowError('NEXT_PUBLIC_PROFILE_ADDRESS is required');
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || ThrowError('NEXT_PUBLIC_RPC_URL is required');

const AVATAR_ADMIN_PK = process.env.AVATAR_ADMIN_PK;
const WEARABLE_ADMIN_SIGNER_PK = process.env.WEARABLE_ADMIN_SIGNER_PK;

const CONFIG = {
    ipfsGateway: 'ipfs://',
};

export const PROVIDER = new JsonRpcProvider(RPC_URL);

export const EOA = AVATAR_ADMIN_PK ? new ethers.Wallet(AVATAR_ADMIN_PK).connect(PROVIDER) : undefined;

export const WEARABLE_ADMIN_SIGNER = WEARABLE_ADMIN_SIGNER_PK ? new Wallet(WEARABLE_ADMIN_SIGNER_PK).connect(PROVIDER) : undefined;

export const OPERATION_CALL = 0;


export const TEMP_CAMPAIGN_SWITCH = { 'vrm_male': 'lukso2', 'vrm_female': 'lukso female b', 'kumi': 'kumi', 'root_citizens': 'root_citizens', 'polygon_citizens': 'polygon_citizens' };

//MAINNET
export const LUKSO_CAMPAIGN_WEB3_DATA = {
    [CampaignConstant.Creators]: {
        contractAddress: '0x74654920356257981f6b63a65ad72d4d9bc21929',
        baseCid: 'bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju'
    }, [CampaignConstant.Citizens]: { contractAddress: '0x754a5d007d5f1188ef0db892ee115a7c01b38fa3', baseCid: '' },
};

const SCHEMAS = [
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

export const AVATAR_ERC725_CONTRACT = new ERC725(SCHEMAS, AVATAR_CONTRACT_ADDRESS, PROVIDER, CONFIG);

export const UNIVERSAL_PROFILE_CONTRACT = new ethers.Contract(
    UNIVERSAL_PROFILE_ADDRESS as string,
    UniversalProfileABI,
    PROVIDER,
);