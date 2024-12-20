import { JsonRpcSigner } from "ethers";
import { DataBaseDrop } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";
import { CardSize, PaymentType } from "../../../enums/citizens/common.enum";
import { useState } from "react";
import Modal from "./modal.ui";
import Button from "./button.ui";
import { useSnackbar } from "../snackbar/snackbar.provider";

interface DropItemCardProps {
  drop: DataBaseDrop;
  userXP: number;
  userAddress: string;
  signer: JsonRpcSigner;
  popupOpen?: boolean;
  onClaim: () => Promise<boolean>;
  isLock?: boolean;
}

export default function DropItemCard({ drop, popupOpen = false, onClaim, isLock = true }: DropItemCardProps) {
  const { showSnackbar } = useSnackbar();
  const [isClaiming, setIsClaiming] = useState(false);
  const [isOpenClaimModal, setIsOpenClaimModal] = useState<boolean>(false);



  const claimHandler = async () => {
    setIsClaiming(true);
    const isSuccess = await onClaim();
    if (isSuccess) {
      showSnackbar(
        <p>The item &quot;{drop.name}&quot; has been successfully claimed!.</p>
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


  return <>
    <CampaignCard
      key={drop.id}
      title={drop.name}
      tokenID={drop.owned ? 'Claimed' : undefined}
      price={drop.owned ? undefined : isLock ? `UNLOCK: ${drop.requiredXP} XP` : `PRICE: ${drop.price} ${drop.paymentType}`}
      chipColor={drop.owned ? undefined : isLock ? 'bg-citizens-yellow' : drop.paymentType === PaymentType.LYX ? 'bg-citizens-red' : 'bg-citizens-blue'}
      blocked={isLock}
      imgSrc={drop.imageUrl}
      imgAlt={drop.name}
      size={CardSize.Small}
      light
      overlayText={drop.owned || isLock ? undefined : "CLICK TO CLAIM"}
      handleClick={() => {
        if (!isLock && !drop.owned) setIsOpenClaimModal(true);
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
              <Button label="Claim" textStyles="w-full text-center" light handleClick={() => claimHandler()} />
              <Button label="Cancel" textStyles="w-full text-center" light handleClick={() => setIsOpenClaimModal(false)} />
            </div>
            :
            <div className="w-4 h-4 border-t rounded-full animate-spin mt-4"></div>
          }
        </div>
      </Modal>
    }
  </>
}