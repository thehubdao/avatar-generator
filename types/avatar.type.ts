export type BodyPart = {
    name: string
    path: string
    thumb: string
    id: string
    index:number
}

export const phaseMap = { whitelistPhase: 'whitelistPhase',airdropPhase: 'airdropPhase', publicMintPhase: 'publicMintPhase' }

export type Phase = keyof typeof phaseMap


