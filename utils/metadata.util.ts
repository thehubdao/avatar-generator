import { StorageLocation } from "../enums/firebase.enum";
import { Campaign, TokenMetadata } from "../types/metadata.type";
import { tempCampaignSwitch } from "./web3/contract.util";
import { UploadFile } from "./firebase.util";

export const uploadMetadata = async (tokenMetadata: TokenMetadata, metadataThumbnail: Blob | undefined, combination: string, campaign: Campaign) => {
    if (metadataThumbnail) {
        const imageFile = new File([metadataThumbnail], `${combination}.png`)
        await UploadFile(imageFile, StorageLocation.AvatarImages, undefined, tempCampaignSwitch[campaign])
    }
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${tempCampaignSwitch[campaign]}%2Favatar_images%2F${combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`

    if (!imageUrl) throw new Error("Error uploading image")

    tokenMetadata.images = [[{
        width: 1024,
        height: 974,
        url: imageUrl,
        verification: {}
    },]]

    const response = await fetch('/api/v1/uploadMetadata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaign, tokenMetadata }),
    });

    if (!response.ok) {
        throw new Error('Failed to upload metadata');
    }

    const { cid } = await response.json();
    return { uri: cid, imageUrl }
}
