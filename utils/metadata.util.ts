import { StorageLocation } from "../enums/firebase.enum";
import { TokenMetadata } from "../types/metadata.type";
import { PinataSDK } from "pinata-web3";
import { tempCampaignSwitch } from "./web3/lukso/contract.util[deprecated]";
import { UploadFile } from "./firebase.util";
import { Campaign } from "../enums/citizens/common.enum";


const pinata = new PinataSDK({ pinataGateway: 'lukso.mypinata.cloud', pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT })


export const uploadMetadata = async (tokenMetadata: TokenMetadata, metadataThumbnail: Blob | undefined, combination: string, campaign: Campaign) => {
    if (metadataThumbnail) {
        const imageFile = new File([metadataThumbnail], `${combination}.png`)

        // Add type check to handle 'kumi' campaign case
        const campaignPath = campaign === 'kumi' ? 'kumi' : tempCampaignSwitch[campaign]
        await UploadFile(imageFile, StorageLocation.AvatarImages, undefined, campaignPath)
    }
    
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${campaign === 'kumi' ? 'kumi' : tempCampaignSwitch[campaign]}%2Favatar_images%2F${combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()
    const file = new File([imageBlob], `${combination}.png`, { type: "image/png" });
    console.log(file, imageBlob)
    const upload = await pinata.upload.file(file, {cidVersion: 0, metadata:{name: `${campaign}-${tokenMetadata.tokenId}-thumbnail`}});
    tokenMetadata.images = [[{
        width: 1024,
        height: 974,
        url: `ipfs://${upload.IpfsHash}`,
        verification: {}
    },]]

    const metadata = await pinata.upload.json({ 'LSP4Metadata': tokenMetadata }, {cidVersion: 1, metadata:{name: `z-${campaign}-${tokenMetadata.tokenId}-metadata`}})
    return { uri: metadata.IpfsHash, imageUrl }
}