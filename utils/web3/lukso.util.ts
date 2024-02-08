import { LUKSO_BACKEND_URL } from "../../constants/common.constant"
import { TokenMetadata } from "../../types/metadata.type"
import { GetRequest, PostRequest } from "../api.util"
import { UpdateAvatarStatus } from "../firebase.util"

type IpfsResponse = {LSP4Metadata:TokenMetadata}

const IPFS_GATEWAY_URL = 'https://4everland.io/ipfs'


export const getTokensMetadata = async (address: string) => {
    const tokensMetadataRequest = await GetRequest<string>(`${LUKSO_BACKEND_URL}/avatarService/getTokensMetadata`, undefined, { address })
    if (!tokensMetadataRequest.success) throw new Error("Error getting tokens metadata")
    return tokensMetadataRequest.value
}

export const getIPFSData = async (cid: string) => {
    const ipfsHTTPUrl = `${IPFS_GATEWAY_URL}/${cid}`
    const ipfsRequest = await fetch(ipfsHTTPUrl/* , {headers:{'x-pinata-gateway-token':'VFS9STK6cE1_B6uNQUciXrcRBAR7ALuzCgJaopOc5qkPiiYfJfkFjPifzfU6l4Di'}} */)
    const ipfsData:IpfsResponse = await ipfsRequest.json() as IpfsResponse

    return ipfsData
}
