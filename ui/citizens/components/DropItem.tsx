import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Drop } from '../../../types/drop.type';
import ClaimableDropABI from '../../../constants/abi/ClaimableDropABI.json';
import { EIP1193Provider } from '@web3-onboard/core';

interface DropItemProps {
  drop: Drop;
  userXP: number;
  userAddress: string;
  provider: EIP1193Provider;
  onClaim: () => void;
}

export default function DropItem({ drop, userXP, userAddress, provider, onClaim }: DropItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    const checkClaimStatus = async () => {
      try {
        const ethersProvider = new ethers.BrowserProvider(provider);
        const contract = new ethers.Contract(drop.contractAddress, ClaimableDropABI, ethersProvider);
        const balance = await contract.balanceOf(userAddress);
        setIsClaimed(balance > 0);
      } catch (error) {
        console.error("Error checking claim status:", error);
      }
    };

    checkClaimStatus();
  }, [drop.contractAddress, userAddress, provider]);

  const getDropStatus = () => {
    if (isClaimed) return 'Claimed';
    if (userXP < drop.requiredXP) return `UNLOCK: ${drop.requiredXP} XP`;
    if (drop.paymentType === 'LYX') return `PRICE: ${drop.price} LYX`;
    if (drop.paymentType === 'TOKEN') return `HOLD
    : ${drop.price}`;
    return '';
  };

  const isClaimable = userXP >= drop.requiredXP && !isClaimed;

  return (
    <div 
      className="relative bg-citizens-dark rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={drop.imageUrl} alt={drop.name} className="w-full h-48 object-cover" />
      
      <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-sm ${isClaimed ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
        {getDropStatus()}
      </div>

      {isClaimable && isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <button
            onClick={onClaim}
            className="bg-citizens-primary text-white px-4 py-2 rounded-md"
          >
            Click to Claim
          </button>
        </div>
      )}

      <div className="p-4 bg-white">
        <h3 className="text-black text-xl mb-2 text-center">{drop.name}</h3>
      </div>
    </div>
  );
}