import { getAddress } from 'ethers'
import mintWhitelist from '../constants/lukso/mintWhitelist.json'
import { Phase, phaseMap } from '../types/avatar.type'

export const currentPhase: Phase | undefined = process.env.NEXT_PUBLIC_MINTING_PHASE as Phase

export const isAddressWhitelisted = (address: string | undefined) => {
    if (mintWhitelist[address?.toLowerCase() as keyof typeof mintWhitelist]) return true
    return false
}

export const canMint = (address: string | undefined) => {
    if (!address) return false
    const formattedAddress = getAddress(address)
    if (!formattedAddress) return false

    if (currentPhase === phaseMap.publicMintPhase) return true
    if (currentPhase === phaseMap.whitelistPhase && isAddressWhitelisted(formattedAddress)) return true

    return false
}