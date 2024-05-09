import { TokenMetadata } from "../../types/metadata.type"


const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY
const IPFS_GATEWAY_API_KEY = process.env.NEXT_PUBLIC_IPFS_GATEWAY_API_KEY


export const getIPFSData = async (cid: string) => {
    const ipfsHTTPUrl = `${IPFS_GATEWAY_URL}/${cid}${IPFS_GATEWAY_API_KEY ? '?pinataGatewayToken=' + IPFS_GATEWAY_API_KEY : ''}`
    const ipfsRequest = await fetch(ipfsHTTPUrl)
    const ipfsData = await ipfsRequest.json() as { LSP4Metadata: TokenMetadata }

    return ipfsData
}

export const getImageUrl = (metadata: TokenMetadata) => {
    const ipfsUrl = metadata.images[0][0].url
    const cid = ipfsUrl.split('//')[1]
    const imageUrl = `${IPFS_GATEWAY_URL}/${cid}${IPFS_GATEWAY_API_KEY ? '?pinataGatewayToken=' + IPFS_GATEWAY_API_KEY : ''}`
    return imageUrl
}