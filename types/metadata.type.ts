import { BodyPart } from "./avatar.type"

export type TokenMetadata = {
    name: string | "",
    description: string | "",
    GLBUrl: string,
    body: {
        head?: BodyPart
        face?: BodyPart
        chest?: BodyPart
        legs?: BodyPart
    }
}
