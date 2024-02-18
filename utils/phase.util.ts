import { Phase } from '../types/avatar.type'
import { isWhitelisted } from './web3/contract.util'

export const currentPhase: Phase | undefined = process.env.NEXT_PUBLIC_MINTING_PHASE as Phase

export const isAddressWhitelisted = async (address: string) => {
    if (await isWhitelisted(address)) return true
    return false
}

export const canMint =  (/* address: string | undefined */) => {
    return true
}