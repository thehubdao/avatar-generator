import { ethers } from "ethers"
import { TokenMetadata } from "../../types/metadata.type"


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

export async function getFollowerCounts(address: string): Promise<{ followerCount: number, followingCount: number }> {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, provider);
  
    const followerCount = await lsp26Contract.followerCount(address);
    const followingCount = await lsp26Contract.followingCount(address);
  
    return {
      followerCount: Number(followerCount),
      followingCount: Number(followingCount)
    };
  }