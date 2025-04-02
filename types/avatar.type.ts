import { TokenMetadata } from "./metadata.type"
import { Campaign } from "../enums/citizens/common.enum"
export type BodyPart = {
    name: string
    path: string
    thumb: string
    id: string
    index:number
}

export const phaseMap = { whitelistPhase: 'whitelistPhase',airdropPhase: 'airdropPhase', publicMintPhase: 'publicMintPhase' }

export type Phase = keyof typeof phaseMap

export interface CollectionType {
    campaign: Campaign;
    combination: string;
    baseCombination:string;
    tokenMetadata: TokenMetadata
  }
