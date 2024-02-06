import { LUKSO_BACKEND_URL } from "../../constants/common.constant"
import { TokenMetadata } from "../../types/metadata.type"
import { GetRequest, PostRequest } from "../api.util"
import { UpdateAvatarStatus } from "../firebase.util"

type IpfsResponse = {LSP4Metadata:TokenMetadata}

const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY

export const mint = async (address: string, metadataUrl: string, combinationId:string) => {
    const mintRequest = await PostRequest<string>(`${LUKSO_BACKEND_URL}/avatarService/mint`, { address, metadataUrl })
    if (!mintRequest.success) throw new Error("Error minting") 
    /* await UpdateAvatarStatus(combinationId, "Minted") */
}

export const getTokensMetadata = async (address: string) => {
    const tokensMetadataRequest = await GetRequest<string>(`${LUKSO_BACKEND_URL}/avatarService/getTokensMetadata`, undefined, { address })
    if (!tokensMetadataRequest.success) throw new Error("Error getting tokens metadata")
    return tokensMetadataRequest.value
}

export const getIPFSData = async (cid: string) => {
    const ipfsHTTPUrl = `${IPFS_GATEWAY_URL}/${cid}`
    const ipfsRequest = await fetch(ipfsHTTPUrl) 
    const ipfsData:IpfsResponse = await ipfsRequest.json() as IpfsResponse

    return ipfsData
}
