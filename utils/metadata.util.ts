import { StorageLocation } from "../enums/firebase.enum";
import { Campaign, TokenMetadata } from "../types/metadata.type";
import pinataSDK from '@pinata/sdk'
import { tempCampaignSwitch } from "./web3/contract.util";
import { UploadFile } from "./firebase.util";

const pinata = new pinataSDK({ pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY, pinataSecretApiKey: process.env.NEXT_PUBLIC_PINATA_API_SECRET })


export const uploadMetadata = async (tokenMetadata: TokenMetadata, metadataThumbnail:Blob, combination:string, campaign:Campaign) => {
    const imageFile = new File([metadataThumbnail], `${combination}.png`)
    await UploadFile(imageFile, StorageLocation.AvatarImages, undefined, tempCampaignSwitch[campaign])
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${tempCampaignSwitch[campaign]}%2Favatar_images%2F${combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`

    if (!imageUrl) throw new Error("Error uploading image")

    tokenMetadata.images = [[{
        width: 1024,
        height: 974,
        url: imageUrl,
        verification: {}
    },]]

    const metadata = await pinata.pinJSONToIPFS({'LSP4Metadata':tokenMetadata})
    return metadata.IpfsHash
}