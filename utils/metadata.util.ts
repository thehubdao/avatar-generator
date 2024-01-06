import { LUKSO_BACKEND_URL } from "../constants/common.constant";
import { TokenMetadata } from "../types/metadata.type";
import { PostRequest } from "./api.util";
import { TakeCanvasPicture } from "../components/avatar/viewer.component";


export const uploadMetadata = async (tokenMetadata: TokenMetadata) => {
    const blob = await TakeCanvasPicture()
    const uploadBlobPutRequest = await fetch(`${LUKSO_BACKEND_URL}/metadataService/storeBlob`, {
        body: blob,
        method: 'PUT',
        headers: {
            'Content-Type': 'image/png',
        }
    })
    const imageUrl = `ipfs://${await uploadBlobPutRequest.text()}`
    if (!imageUrl) throw new Error("Error uploading image")

    tokenMetadata.images = [[{
        width: 1024,
        height: 974,
        url: imageUrl,
        verification:{}
    },]]

    const uploadMetadataPostRequest = await PostRequest<string>(`${LUKSO_BACKEND_URL}/metadataService/createMetadata`, {'LSP4Metadata':tokenMetadata})
    if (!uploadMetadataPostRequest.success) throw new Error("Error uploading metadata")

    return uploadMetadataPostRequest.value
}