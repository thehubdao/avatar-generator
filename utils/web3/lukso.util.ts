import { LUKSO_BACKEND_URL } from "../../constants/common.constant"
import { GetRequest, PostRequest } from "../api.util"

const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY

export const mint = async (address: string, metadataUrl: string) => {
    const mintRequest = await PostRequest<string>(`${LUKSO_BACKEND_URL}/avatarService/mint`, { address, metadataUrl })
    if (!mintRequest.success) throw new Error("Error minting")
}

export const getTokensMetadata = async (address: string) => {
    const tokensMetadataRequest = await GetRequest<string>(`${LUKSO_BACKEND_URL}/avatarService/getTokensMetadata`, undefined, { address })
    if (!tokensMetadataRequest.success) throw new Error("Error getting tokens metadata")
    return tokensMetadataRequest.value
}

export const getIPFSData = async (ipfsUrl: string) => {
    const CID = ipfsUrl.split('//')[1]
    const ipfsHTTPUrl = `${IPFS_GATEWAY_URL}/${CID}`
    const ipfsRequest = await fetch(ipfsHTTPUrl).then(res => res.json())

    return ipfsRequest
}
