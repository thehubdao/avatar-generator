import { useState } from "react";
import { Signer } from "ethers";
import TransparentBoxUI from "./transparentBox.ui";
import Loader from "./loader.ui";
import { FaRegCheckCircle } from "react-icons/fa";

interface MintSectionModalUIPros {
  setIsMinting: (value: boolean) => void;
  signer: Signer | undefined;
  handleClaim: (address: string, signer: Signer) => Promise<{ message: string, success: boolean }>;
  gsapOutBlocks: () => void
}

export default function MintSectionModalUI({ setIsMinting, signer, handleClaim, gsapOutBlocks }: MintSectionModalUIPros) {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isProvidingFeedback, setIsProvidingFeedback] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("message");
  const [isFeedbackError, setIsFeedbackError] = useState<boolean>(false);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleButtonClaim = async () => {
    if (!signer) return
    setIsClaiming(true);
    const address = await signer.getAddress()
    const result = await handleClaim(address, signer)

    setIsClaiming(false);
    setIsProvidingFeedback(true);
    setFeedbackMessage(result.message);
    setIsFeedbackError(result.success);

    if (result.success) {
      await delay(5000);
      setIsMinting(false);
      gsapOutBlocks();
    }
  }

  return (
    <div className="z-10 bg-black bg-opacity-30 w-full h-screen fixed top-0 flex justify-center items-center">
      <TransparentBoxUI fullWidth border heightClass="h-fit min-h-[240px]" backgroundColorClass="bg-[#FFCBDE]">
        {(!isClaiming && !isProvidingFeedback) && (
          <div className="min-w-[515px] flex flex-col gap-4">
            <h3 className="text-2xl">Claim your citizen</h3>
            <p>Are you sure that you want to claim this citizen?</p>
            <div className="flex justify-between">
              <button className="w-52 h-fit" onClick={() => { setIsMinting(false) }}>
                <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                  <div className="flex items-center gap-3">
                    <p className="text-black">Go Back</p>
                  </div>
                </TransparentBoxUI>
              </button>
              <button className="w-52 h-fit" onClick={() => { handleButtonClaim() }}>
                <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                  <div className="flex items-center gap-3">
                    <p className="text-black">Claim</p>
                  </div>
                </TransparentBoxUI>
              </button>
            </div>
          </div>
        )}
        {isClaiming && (
          <div className="flex flex-col justify-center items-center gap-4">
            <p>Synthesizing your unique digital genome... Your custom avatar is being created!</p>
            <Loader />
          </div>
        )}
        {isProvidingFeedback && (
          <div className="min-w-[515px] flex flex-col justify-center items-center gap-4">
            {isFeedbackError ? (
              <>
                <h3 className="text-2xl">Congratulations!</h3>
                <p>{feedbackMessage}</p>
                <FaRegCheckCircle className="text-7xl" />
              </>
            ) : (
              <>
                <h3 className="text-2xl">Oops!</h3>
                <p>{feedbackMessage}</p>
                <button className="w-52 h-fit" onClick={() => { setIsMinting(false) }}>
                  <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                    <div className="flex items-center gap-3">
                      <p className="text-black">Go Back</p>
                    </div>
                  </TransparentBoxUI>
                </button>
              </>
            )}

          </div>
        )}
      </TransparentBoxUI>
    </div>
  )
}