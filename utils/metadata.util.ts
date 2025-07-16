import { CitizenMetadata, LuksoMetadata, PolygonMetadata, SolanaMetadata } from "../interfaces/citizens.interface";
import { PinataSDK } from "pinata-web3";
import { Campaign, CampaignBaseCombination } from "../enums/citizens/common.enum";
import { Result } from "../types/common.type";
import { CommonErrorCode, Module } from "../enums/common.enum";
import { LogError } from "./common.util";
import { TEMP_CAMPAIGN_SWITCH } from "../constants/lukso/contract.constant";


const pinata = new PinataSDK({ pinataGateway: 'lukso.mypinata.cloud', pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT })

export async function GetImageUrl(campaign: Campaign, combination: string): Promise<string> {
    combination = CampaignBaseCombination.Based; //TEMPORARILY SET TO BASE COMBINATION FOR ALL NFTS
    return `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${TEMP_CAMPAIGN_SWITCH[campaign]}%2Favatar_images%2F${combination}.png?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`
}

export async function GetIpfsHttpsUrl(cid: string): Promise<string> {
    return `https://thehub.mypinata.cloud/ipfs/${cid}`
}

export async function GetVrmUrl(campaign: Campaign, combination: string): Promise<string> {
    return `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${campaign}%2Favatar_vrms%2F${combination}.vrm?alt=media&token=d6808b15-0859-4025-8397-f3137bb170cb`
}

export async function UploadLuksoMetadata(tokenMetadata: LuksoMetadata, combination: string, campaign: Campaign): Promise<Result<{ uri: string, imageUrl: string }>> {
    try {
        const imageUrl = await GetImageUrl(campaign, combination);
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const file = new File([imageBlob], `${combination}.png`, { type: "image/png" });
        const upload = await pinata.upload.file(file, { cidVersion: 0, metadata: { name: `${campaign}-${tokenMetadata.tokenId}-thumbnail` } });
        tokenMetadata.images = [[{
            width: 1024,
            height: 974,
            url: `ipfs://${upload.IpfsHash}`,
            verification: {}
        },]];

        const metadata = await pinata.upload.json({ 'LSP4Metadata': tokenMetadata }, { cidVersion: 1, metadata: { name: `z-${campaign}-${tokenMetadata.tokenId}-metadata` } });

        return { success: true, value: { uri: metadata.IpfsHash, imageUrl } };
    } catch (error) {
        const err = error as Error;
        void LogError(Module.Citizens, 'Error on uploading Lukso metadata', error);
        return { success: false, errMessage: err.message, errCode: CommonErrorCode.InternalError };
    }
}

export async function UploadSolanaMetadata(tokenMetadata: CitizenMetadata, combination: string, campaign: Campaign): Promise<Result<{ uri: string, imageUrl: string }>> {
    try {
        const imageUrl = await GetImageUrl(campaign, combination);
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const imageFile = new File([imageBlob], `${combination}.png`, { type: "image/png" });
        const imageCid = await pinata.upload.file(imageFile, { cidVersion: 1, metadata: { name: `${campaign}-${combination}-thumbnail` } });

        const vrmUrl = await GetVrmUrl(campaign, combination);
        const vrmResponse = await fetch(vrmUrl);
        const vrmBlob = await vrmResponse.blob();
        const vrmFile = new File([vrmBlob], `${combination}.vrm`, { type: "model/vrm" });
        const vrmCid = await pinata.upload.file(vrmFile, { cidVersion: 1, metadata: { name: `${campaign}-${combination}-vrm` } });

        const solanaMetadata: SolanaMetadata = {
            ...tokenMetadata.rawMetadata as SolanaMetadata,
            image: `ipfs://${imageCid.IpfsHash}`,
            properties: {
                files: [{ uri: `ipfs://${imageCid.IpfsHash}`, type: "image/png" }],
                category: "avatar"
            },
            vrm_url: `ipfs://${vrmCid.IpfsHash}`
        }

        const metadata = await pinata.upload.json(solanaMetadata, { cidVersion: 1, metadata: { name: `z-${campaign}-${tokenMetadata.tokenId}-metadata` } });

        return { success: true, value: { uri: metadata.IpfsHash, imageUrl } };
    } catch (error) {
        const err = error as Error;
        void LogError(Module.Citizens, 'Error on uploading Solana metadata', error);
        return { success: false, errMessage: err.message, errCode: CommonErrorCode.InternalError };
    }

}

export async function UploadPolygonMetadata(tokenMetadata: CitizenMetadata, combination: string, campaign: Campaign): Promise<Result<{ uri: string, imageUrl: string }>> {
    try {
        const imageUrl = await GetImageUrl(campaign, combination);
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const file = new File([imageBlob], `${combination}.png`, { type: "image/png" });
        const upload = await pinata.upload.file(file, { cidVersion: 0, metadata: { name: `${campaign}-${tokenMetadata.tokenId}-thumbnail` } });

        const polygonMetadata: PolygonMetadata = {
            ...tokenMetadata.rawMetadata as PolygonMetadata,
            image: `ipfs://${upload.IpfsHash}`
        }

        const metadata = await pinata.upload.json(polygonMetadata, { cidVersion: 1, metadata: { name: `${campaign}-${tokenMetadata.tokenId}-metadata` } });

        return { success: true, value: { uri: `ipfs://${metadata.IpfsHash}`, imageUrl } };
    } catch (error) {
        const err = error as Error;
        void LogError(Module.Citizens, 'Error on uploading Lukso metadata', error);
        return { success: false, errMessage: err.message, errCode: CommonErrorCode.InternalError };
    }
}