import { LUKSO_BACKEND_URL } from "../constants/common.constant";
import { TokenMetadata } from "../types/metadata.type";
import { PostRequest } from "./api.util";

export const uploadMetadata = async (tokenMetadata: TokenMetadata) => {
    const uploadPostRequest = await PostRequest<string>(`${LUKSO_BACKEND_URL}/metadataService/createMetadata`, tokenMetadata)
    if(!uploadPostRequest.success) throw new Error("Error uploading metadata")
    return uploadPostRequest.value
}