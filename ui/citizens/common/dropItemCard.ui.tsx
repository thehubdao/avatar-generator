import { JsonRpcSigner } from "ethers";
import { Drop } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";
import { CardSize, PaymentType } from "../../../enums/citizens/common.enum";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ClaimableDropABI from '../../../constants/abi/ClaimableDropABI.json';
import Modal from "./modal.ui";
import Button from "./button.ui";
import { useSnackbar } from "../snackbar/snackbar.provider";

interface DropItemCardProps {
  drop: Drop;
  userXP: number;
  userAddress: string;
  signer: JsonRpcSigner;
  popupOpen?: boolean;
  onClaim: () => Promise<boolean>;
}

export default function DropItemCard({ drop, userXP, userAddress, signer, popupOpen = false, onClaim }: DropItemCardProps) {
  const { showSnackbar } = useSnackbar();

  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLock] = useState(userXP < drop.requiredXP);
  const [isOpenClaimModal, setIsOpenClaimModal] = useState<boolean>(false);

  const checkClaimStatus = async () => {
    try {
      const contract = new ethers.Contract(drop.contractAddress, ClaimableDropABI, signer);
      const balance = await contract.balanceOf(userAddress);
      setIsClaimed(balance > 0);
    } catch (error) {
      console.error("Error checking claim status:", error);
    }
  };

  const claimHandler = async () => {
    setIsClaiming(true);
    const isSuccess = await onClaim();
    if (isSuccess) {
      await checkClaimStatus();
      showSnackbar(
        <p>The item &quot;{drop.name}&quot; has been successfully reclaimed!.</p>
      )
    } else {
      showSnackbar(
        <p>Something went wrong, the item was not claimed. Try again later.</p>
      )
    }
    setIsOpenClaimModal(false);
    setIsClaiming(false);
  }

  const cancelClaiming = () => {
    setIsOpenClaimModal(false);
    setIsClaiming(false);
    showSnackbar(
      <p>If the pop-up does not open, the process will soon be cancelled</p>
    )
  }

  useEffect(() => {
    checkClaimStatus();
  }, []);

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
        if (!isLock && !isClaimed) setIsOpenClaimModal(true);
      }}
    />
    {isOpenClaimModal &&
      <Modal modalStyles="h-fit" handleClose={() => { !isClaiming && setIsOpenClaimModal(false) }}>
        <div className="grid justify-items-center">
          <div className="text-center text-white grid gap-4">
            {isClaiming ?
              <>
                <p className="font-bold text-2xl">Claiming<br />{drop.name}</p>
                {
                  popupOpen ?
                    <>
                      <p className="text-lg">Confirm the transaction on the extension.</p>
                      <p className="text-xs">The pop-up does not open yet?<br /><span className="underline cursor-pointer" onClick={() => cancelClaiming()}>click here.</span></p>
                    </>
                    :
                    <>
                      <p className="text-lg">Check the pop-up from your wallet to continue with the claim process.</p>
                      <p className="text-xs">Pop-up will open soon...</p>
                    </>
                }
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
              <Button label="Claim" textStiles="w-full text-center" light handleClick={() => claimHandler()} />
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