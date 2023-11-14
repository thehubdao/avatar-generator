import { LUKSO_BACKEND_URL } from "../../constants/common.constant"
import { GetRequest, PostRequest } from "../api.util"



const mint = async (address: string, metadataUrl: string) => {
    const mintRequest = await PostRequest<string>(`${LUKSO_BACKEND_URL}/avatarService/mint`, {address,metadataUrl})
    if(!mintRequest.success) throw new Error("Error minting")
}

const getTokensMetadata = async (address: string) => {
    const tokensMetadataRequest = await GetRequest<string>(`${LUKSO_BACKEND_URL}/avatarService/getTokensMetadata`, undefined, {address})
    if(!tokensMetadataRequest.success) throw new Error("Error getting tokens metadata")
    return tokensMetadataRequest.value
}

export { mint, getTokensMetadata }