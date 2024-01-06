import { BodyPart } from "./avatar.type"

export type TokenMetadataImage = {
    "width": number,
    "height": number,
    "url": string,
    "verification": object | undefined
}

export type TokenMetadata = {
    name: string | "",
    description: string | "",
    GLBUrl: string,
    images?: Array<Array<TokenMetadataImage>>
    links?: [], assets?: [],
    body: {
        head?: BodyPart
        face?: BodyPart
        chest?: BodyPart
        legs?: BodyPart
    }
}
