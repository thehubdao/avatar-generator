import { Contract, ethers } from 'ethers';
import ClaimableDropABI from '../../constants/abi/ClaimableDropABI.json';
import UniversalProfileABI from '../../constants/abi/UniversalProfileABI.json';
import { GetClaimableDrops } from '../../utils/firebase.util';
import { PaymentType } from '../../enums/citizens/common.enum';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const PK = process.env.NEXT_PUBLIC_PK!;
const UNIVERSAL_PROFILE_ADDRESS = process.env.NEXT_PUBLIC_PROFILE_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const EOA = new ethers.Wallet(PK, provider);
const universalProfile = new ethers.Contract(UNIVERSAL_PROFILE_ADDRESS!, UniversalProfileABI, provider);

export async function ApproveClaimForUser(address: string, dropId: string): Promise<boolean> {
  try {
    const drops = await GetClaimableDrops(dropId);
    if (drops.length === 0) {
      console.error('Drop not found');
      return false;
    }
    const drop = drops[0];

    if (drop.paymentType === PaymentType.TOKEN && drop.holdingAddresses?.length > 0) {
      const holdingCondition = drop.holdingCondition || '|'; 
      
      const balanceChecks = await Promise.all(
        drop.holdingAddresses.map(async ({contractAddress}) => {
          const tokenContract = new ethers.Contract(contractAddress, ClaimableDropABI, provider);
          const tokenBalance = await tokenContract.balanceOf(address);
          return !tokenBalance.isZero();
        })
      );

      const hasRequiredTokens = holdingCondition === '&'
        ? balanceChecks.every(Boolean)  
        : balanceChecks.some(Boolean); 

      if (!hasRequiredTokens) {
        console.error('User does not meet token holding requirements');
        return false;
      }
    }

    const dropContract = new ethers.Contract(drop.contractAddress, ClaimableDropABI, provider);
    const approveClaimFunction = dropContract.interface.encodeFunctionData('approveClaim', [[address]]);

    const tx = await (universalProfile.connect(EOA) as Contract).execute(
      0,
      drop.contractAddress,
      0,
      approveClaimFunction
    );

    await tx.wait();
    
    return true;
  } catch (error) {
    console.error('Error in approveClaimForUser:', error);
    return false;
  }
}