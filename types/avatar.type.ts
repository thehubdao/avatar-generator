export type BodyPart = {
    name: string
    path: string
    thumb: string
    id: string
}

export const phaseMap = { whitelistPhase: 'whitelistPhase',airdropPhase: 'airdropPhase', publicMintPhase: 'publicMintPhase' }

export type Phase = keyof typeof phaseMap


