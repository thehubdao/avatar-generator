import { BodyPart } from "./avatar.type"

export type TokenMetadataImage = {
    "width": Number,
    "height": Number,
    "url": string,
    "verification": {}
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
