import { LUKSO_BACKEND_URL } from "../constants/common.constant";
import { TokenMetadata } from "../types/metadata.type";
import { PostRequest } from "./api.util";


export const uploadMetadata = async (tokenMetadata: TokenMetadata, combinationIndexes: string) => {
/*     const blob = await TakeCanvasPicture()
    console.log(blob)
    const uploadBlobPutRequest = await fetch(`${LUKSO_BACKEND_URL}/metadataService/storeBlob`, {
        body: blob,
        method: 'PUT',
        headers: {
            'Content-Type': 'image/png',
        }
    }) */
    const imageUrl = `ipfs://${process.env.NEXT_PUBLIC_IPFS_IMAGE_URL}/${combinationIndexes}.png`
    if (!imageUrl) throw new Error("Error uploading image")

    tokenMetadata.images = [[{
        width: 1024,
        height: 974,
        url: imageUrl,
        verification: {}
    },]]

    const uploadMetadataPostRequest = await PostRequest<string>(`${LUKSO_BACKEND_URL}/metadataService/createMetadata`, { 'LSP4Metadata': tokenMetadata })
    if (!uploadMetadataPostRequest.success) throw new Error("Error uploading metadata")

    return uploadMetadataPostRequest.value
}