import { ethers } from "ethers"
import { TokenMetadata } from "../../types/metadata.type"
import LSP3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import ERC725, { ERC725JSONSchema } from "@erc725/erc725.js";
import { FetchDataOutput } from "@erc725/erc725.js/build/main/src/types/decodeData";

const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY
const IPFS_GATEWAY_API_KEY = process.env.NEXT_PUBLIC_IPFS_GATEWAY_API_KEY
const LSP26_ADDRESS = '0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA';

const LSP26_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'followerCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'followingCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const getIPFSData = async (cid: string) => {
    const ipfsHTTPUrl = `${IPFS_GATEWAY_URL}/${cid}${IPFS_GATEWAY_API_KEY ? '?filebaseGatewayToken=' + IPFS_GATEWAY_API_KEY : ''}`
    const ipfsRequest = await fetch(ipfsHTTPUrl)
    const ipfsData = await ipfsRequest.json() as { LSP4Metadata: TokenMetadata }

    return ipfsData
}

export const getImageUrl = (metadata: TokenMetadata) => {
    const ipfsUrl = metadata.images[0][0].url
    const cid = ipfsUrl.split('//')[1]

    const imageUrl = `${IPFS_GATEWAY_URL}/${cid}${IPFS_GATEWAY_API_KEY ? '?filebaseGatewayToken=' + IPFS_GATEWAY_API_KEY : ''}`
    return imageUrl
}

export async function GetFollowerCounts(address: string): Promise<{ followerCount: number, followingCount: number }> {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, provider);
  
    const followerCount = await lsp26Contract.followerCount(address);
    const followingCount = await lsp26Contract.followingCount(address);
  
    return {
      followerCount: Number(followerCount),
      followingCount: Number(followingCount)
    };
  }

export async function GetUniversalProfileData(address: string) {
  try {
    // 1. Crear instancia de ERC725
    const erc725js = new ERC725(
      LSP3ProfileSchema as ERC725JSONSchema[],
      address,
      process.env.NEXT_PUBLIC_RPC_URL,
      {
        ipfsGateway: 'https://api.universalprofile.cloud/ipfs'
      }
    );

    // 2. Obtener los metadatos del perfil LSP3
    const profileData = await erc725js.fetchData('LSP3Profile') as FetchDataOutput;
    // 3. Validar y extraer los datos
    if (!profileData?.value || typeof profileData.value === 'string' || !('LSP3Profile' in profileData.value)) {
      return {
        name: '',
        profileImage: ''
      };
    }

    // 4. Procesar la imagen del perfil
    let imageUrl = '';
    if (profileData.value.LSP3Profile.profileImage?.[0]) {
      const url = profileData.value.LSP3Profile.profileImage[0].url;
      if (url.startsWith('ipfs://')) {
        const cid = url.replace('ipfs://', '');
        imageUrl = `https://api.universalprofile.cloud/ipfs/${cid}`;
      } else {
        imageUrl = url;
      }
    }
    return {
      name: profileData.value.LSP3Profile.name || '',
      profileImage: imageUrl
    };

  } catch (error) {
    console.error('Error fetching Universal Profile data:', error);
    return {
      name: '',
      profileImage: ''
    };
  }
}
