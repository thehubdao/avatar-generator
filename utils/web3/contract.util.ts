import { Contract, getDefaultProvider } from 'ethers'
import avatarContractAbi from '../../constants/abi/AvatarContractABI.json'
const AVATAR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AVATAR_CONTRACT_ADDRESS
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL




export const getSupply = async () => {
    if (!AVATAR_CONTRACT_ADDRESS || !RPC_URL) return
    const provider = getDefaultProvider(RPC_URL)
    const avatarContract = new Contract(AVATAR_CONTRACT_ADDRESS, avatarContractAbi, provider)
    const totalSupply = Number(await avatarContract.totalSupply())

    return totalSupply
}