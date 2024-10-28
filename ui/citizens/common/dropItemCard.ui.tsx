import { EIP1193Provider } from "@web3-onboard/core";
import { Drop } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";
import { CardSize, PaymentType } from "../../../enums/citizens/common.enum";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ClaimableDropABI from '../../../constants/abi/ClaimableDropABI.json';
import Modal from "./modal.ui";
import Button from "./button.ui";

interface DropItemCardProps {
  drop: Drop;
  userXP: number;
  userAddress: string;
  provider: EIP1193Provider;
  onClaim: () => void;
}

export default function DropItemCard({ drop, userXP, userAddress, provider, onClaim }: DropItemCardProps) {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLock] = useState(userXP < drop.requiredXP);
  const [isOpenClaimModal, setIsOpenClaimModal] = useState<boolean>(false);

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

  return <>
    <CampaignCard
      key={drop.id}
      title={drop.name}
      tokenID={isClaimed ? 'Claimed' : undefined}
      price={isClaimed ? undefined : isLock ? `UNLOCK: ${drop.requiredXP} XP` : `PRICE: ${drop.price} ${drop.paymentType}`}
      chipColor={isClaimed ? undefined : isLock ? 'bg-citizens-yellow' : drop.paymentType === PaymentType.LYX ? 'bg-citizens-red' : 'bg-citizens-blue'}
      blocked={isLock}
      imgSrc={drop.imageUrl}
      imgAlt={drop.name}
      size={CardSize.Small}
      light
      overlayText={isClaimed || isLock ? undefined : "CLICK TO CLAIM"}
      handleClick={() => {
        if (!isLock) setIsOpenClaimModal(true);
      }}
    />
    {isOpenClaimModal &&
      <Modal handleClose={() => setIsOpenClaimModal(false)}>
        <div className="grid justify-items-center">
          <div className="text-center text-white grid gap-4">
            {isClaiming ?
              <>
                <p className="font-bold text-2xl">Claiming<br />{drop.name}</p>
                <p className="text-lg">Check the pop-up from your wallet to continue with the claim process.</p>
                <p className="text-xs">Pop-up will open soon...</p>
              </>
              :
              <>
                <p className="font-bold text-2xl">Claim Item:<br />{drop.name}</p>
                <p className="text-lg">This item will be claimed for the following Price:<br />{drop.price} {drop.paymentType}</p>
              </>
            }
          </div>
          {!isClaiming ?
            <div className="grid gap-4 pt-8">
              <Button label="Claim" textStiles="w-full text-center" light handleClick={() => {
                setIsClaiming(true);
                onClaim();
              }} />
              <Button label="Cancel" textStiles="w-full text-center" light handleClick={() => setIsOpenClaimModal(false)} />
            </div>
            :
            <div className="w-4 h-4 border-t rounded-full animate-spin mt-4"></div>
          }
        </div>
      </Modal>
    }
  </>
}