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
    attributes?: Array<{ key: string, value: string, type: string }>
    links?: [], assets?: [],
    body: {
        head?: BodyPart
        face?: BodyPart
        chest?: BodyPart
        legs?: BodyPart
    }
}
