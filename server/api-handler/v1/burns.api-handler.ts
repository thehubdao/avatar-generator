import { XPReward } from '../../../constants/lukso/xp.constant';
import { CreateNotification, UpdateUserXP } from '../../../utils/firebase.util';

export async function HandleBurnXPReward(address: string, burnCount: number): Promise<void> {
  try {
    const totalXP = burnCount * XPReward.BurnDrop;
    
    // Update user XP
    await UpdateUserXP(address, totalXP);
    
    // Create notification for the burn reward
    await CreateNotification(address, {
      title: 'Drop Burn Reward',
      message: `You earned ${totalXP} XP for burning ${burnCount} drops!`,
      points: totalXP,
      time: new Date().toISOString(),
      id: ''
    });

  } catch (error) {
    console.error('Error handling burn XP reward:', error);
    throw error;
  }
} 