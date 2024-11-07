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
    tokenId: string
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

export type TokenId = { tokenId: string, campaign: string, metadataUri:string}

export const campaigns = { 'vrm_male': 'vrm_male', 'vrm_female': 'vrm_female' }

export type Campaign = keyof typeof campaigns

export type CampaignData = { [campaign in Campaign]: { contractAddress: string, baseCid: string } }

export type CampaignDrops = { [campaign in Campaign]: Drop[] }

export type Drop = {
    balance?: number,
    contract_address:string,
    index:number,
    type:string,
    name:string
}

export type CampaignMetadata = {
    [campaign in Campaign]: TokenMetadata[] }