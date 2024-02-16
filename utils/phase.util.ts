import { getAddress } from 'ethers'
import { Phase, phaseMap } from '../types/avatar.type'
import { isWhitelisted } from './web3/contract.util'

export const currentPhase: Phase | undefined = process.env.NEXT_PUBLIC_MINTING_PHASE as Phase

export const isAddressWhitelisted = async (address: string) => {
    if (await isWhitelisted(address)) return true
    return false
}

export const canMint = async (address: string | undefined) => {
    if (!address) return false

    if (currentPhase === phaseMap.publicMintPhase) return true

    const formattedAddress = getAddress(address)

    if (!formattedAddress) return false

    if (currentPhase === phaseMap.whitelistPhase && await isAddressWhitelisted(formattedAddress)) return true

    return false
}