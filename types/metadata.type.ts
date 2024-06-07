import { BodyPart } from "./avatar.type"

export type TokenMetadataImage = {
    "width": number,
    "height": number,
    "url": string,
    "verification": object | undefined
}

export type TokenMetadata = {
    fallbackImageUrl: string
    imageUrl: string
    combination: string
    baseCombination: string
    campaign: string
    tokenId: number
    name: string | "",
    description: string | "",
    GLBUrl: string,
    images: Array<Array<TokenMetadataImage>>
    attributes?: Array<{ key: string, value: string, type: string }>
    links?: [], assets?: [],
    body: {
        head?: BodyPart
        face?: BodyPart
        chest?: BodyPart
        legs?: BodyPart
    }
}

export const campaigns = { 'VRM_MALE': 'VRM_MALE', 'VRM_FEMALE': 'VRM_FEMALE' }

export type Campaign = keyof typeof campaigns

export type CampaignData = { [campaign in Campaign]: { contractAddress: string, baseCid: string } }

export type CampaignMetadata = {
    [campaign in Campaign]: TokenMetadata[] }