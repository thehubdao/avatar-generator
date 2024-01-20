import mintWhitelist from '../constants/lukso/mintWhitelist.json'
import { Phase, phaseMap } from '../types/avatar.type'

export const currentPhase: Phase | undefined = process.env.NEXT_PUBLIC_MINTING_PHASE as Phase

export const isAddressWhitelisted = (address: string | undefined) => {
    if (mintWhitelist[address as keyof typeof mintWhitelist]) return true
    return false
}

export const canMint = (address: string | undefined) => {
    if(currentPhase === phaseMap.publicMintPhase) return true
    if(currentPhase === phaseMap.whitelistPhase && isAddressWhitelisted(address)) return true

    return false
 }