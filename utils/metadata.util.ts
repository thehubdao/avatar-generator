import { TokenMetadata } from "../types/metadata.type";
import pinataSDK from '@pinata/sdk'

const pinata = new pinataSDK({ pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY, pinataSecretApiKey: process.env.NEXT_PUBLIC_PINATA_API_SECRET })


export const uploadMetadata = async (tokenMetadata: TokenMetadata, combinationIndexes: string) => {
    const imageUrl = `ipfs://${process.env.NEXT_PUBLIC_IPFS_IMAGE_URL}/${combinationIndexes}.png`
    if (!imageUrl) throw new Error("Error uploading image")

    tokenMetadata.images = [[{
        width: 1024,
        height: 974,
        url: imageUrl,
        verification: {}
    },]]

    const metadata = await pinata.pinJSONToIPFS(tokenMetadata)
    return metadata.IpfsHash
}