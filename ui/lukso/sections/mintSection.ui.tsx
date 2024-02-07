import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import TransparentBox from "../common/transparentBox.ui"
import { translationInOutBlock, fadeInOutBlock } from "../../../utils/gsap/block_in_out.util";
import { BsArrowRepeat } from "react-icons/bs";
import { FaArrowRightLong } from "react-icons/fa6";
import SocialButtonsUI from "../common/socialButtons.ui";
import { LuksoSections } from "../../../enums/lukso/common.enum";
import { DURATION_ANIMATION_SECTION } from "../../../constants/lukso/animation.constant";
import MintSectionModalUI from "../common/mintModal.ui";
import { BrowserProvider, ethers } from "ethers";
import Loader from "../common/loader.ui";
import { IndexFeatureInterface } from "../../../interfaces/api.interface";
import FeatureListUI from "../common/featureList.ui";

interface MintSectionUIProps {
  setCurrentSection: (value: LuksoSections) => void;
  reRoll: () => Promise<void>;
  handleClaim: (address: string, provider: BrowserProvider) => Promise<{ message: string, success: boolean }>;
  provider: ethers.BrowserProvider | undefined;
  features?: IndexFeatureInterface[];
  picture: string;
}

export default function MintSectionUI({ setCurrentSection, reRoll, handleClaim, provider, features, picture }: MintSectionUIProps) {

  const mainFeatureRef = useRef<HTMLDivElement>(null);
  const mintAvatarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [waitingCounterToMakeReshuffle, setWaitingCounterToMakeReshuffle] = useState<number>(0);

  const gsapEnterBlocks = () => {
    if (!mainFeatureRef.current || !mintAvatarRef.current || !buttonRef.current) return
    translationInOutBlock(mainFeatureRef.current, DURATION_ANIMATION_SECTION);
    translationInOutBlock(mintAvatarRef.current, DURATION_ANIMATION_SECTION);
    fadeInOutBlock(buttonRef.current, DURATION_ANIMATION_SECTION);
  }

  const gsapOutBlocks = () => {
    if (!mainFeatureRef.current || !mintAvatarRef.current || !buttonRef.current) return
    translationInOutBlock(mainFeatureRef.current, DURATION_ANIMATION_SECTION, true);
    translationInOutBlock(mintAvatarRef.current, DURATION_ANIMATION_SECTION, true, true);
    fadeInOutBlock(buttonRef.current, DURATION_ANIMATION_SECTION, true, () => setCurrentSection(LuksoSections.Edit));
  }

  const handleWaitingReshuffle = (countValue: number) => {
    setTimeout(() => {
      if (countValue >= 0) {
        setWaitingCounterToMakeReshuffle(countValue);
        handleWaitingReshuffle(countValue - 1);
      }
    }, 1000);
  }

  const handleReRoll = async () => {
    if (isShuffling || waitingCounterToMakeReshuffle !== 0) return;
    const WAIT_COUNTER = 10;
    setIsShuffling(true);
    await reRoll();
    setWaitingCounterToMakeReshuffle(WAIT_COUNTER);
    setIsShuffling(false);
    handleWaitingReshuffle(WAIT_COUNTER - 1);
  }

  useEffect(() => {
    void gsapEnterBlocks();
  }, [])

  const handleMint = () => {
    if (isShuffling || waitingCounterToMakeReshuffle !== 0) return;
    setIsMinting(true)
  }

  return (
    <section className={`flex w-full h-full items-center justify-between`}>
      <div className={`fixed h-screen w-full flex justify-center items-center bg-[#FFCBDE] top-14 duration-100 transition-all ${isShuffling ? 'flex' : 'hidden'}`}>
        <div className="scale-[3]">
          <Loader />
        </div>
      </div>
      {/* Mint features */}
      <div ref={mainFeatureRef} className="w-[360px] 2xl:w-[461px] -translate-x-full h-full flex flex-col gap-3">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
          borderSizeClass="border-t-0"
        >
          <div className="relative w-[208px] 2xl:w-[347px] h-[180px] 2xl:h-[301px] overflow-hidden rounded-lg">
            <Image
              src={picture}
              fill
              alt="lukso avatar selfie view"
              style={{ objectFit: 'cover' }} 
              className="origin-top scale-[300%] -translate-y-1/4"
            />
          </div>
          {features &&
            <FeatureListUI features={features} />
          }
        </TransparentBox>
      </div>

      {/* Buttons */}
      <div ref={buttonRef} className="fixed bottom-[15%] left-1/2 -translate-x-[50%] flex flex-col w-[240px] justify-end gap-3 text-black text-lg 2xl:text-xl opacity-0">
        <button className="w-full h-fit" onClick={() => void handleReRoll()}>
          <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
            <div className="flex items-center gap-3">
              {waitingCounterToMakeReshuffle > 0 ? (
                <p>{`Wait(${waitingCounterToMakeReshuffle} sec)`}</p>
              ) : (
                <p>{isShuffling ? 'Shuffling' : 'Reshuffle'}</p>
              )}
              <BsArrowRepeat className={`${isShuffling ? 'animate-spin' : ''}`} />
            </div>
          </TransparentBox>
        </button>
        <button className="w-full h-fit" onClick={() => handleMint() } disabled={isShuffling || waitingCounterToMakeReshuffle !== 0}>
          <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" aditionalClass={`${(isShuffling || waitingCounterToMakeReshuffle !== 0) && "opacity-70"}`}>
            <div className="flex items-center gap-3">
              Claim
              <FaArrowRightLong className="text-base" />
            </div>
          </TransparentBox>
        </button>
      </div>

      {/* Mint your avatar */}
      <div ref={mintAvatarRef} className="w-[460px] 2xl:w-[564px] translate-x-full h-[70%]">
        <TransparentBox fullWidth border backgroundColorClass="bg-[#FFCBDE]" paddingClass="px-14 2xl:px-28" aditionalClass="gap-6 2xl:gap-8">
          <h3 className="font-semibold  text-xl 2xl:text-2xl mb-10">MINT YOUR CITIZEN</h3>
          <p className="text-base 2xl:text-lg">
            LUKSO Citizens is a collection of 1764 interoperable Avatars on the LUKSO Blockchain.
          </p>
          <SocialButtonsUI />
          <div className="font-semibold">
            <p>Senators Mint</p>
          </div>
        </TransparentBox>
      </div>

      {isMinting && <MintSectionModalUI
        setIsMinting={(value) => setIsMinting(value)}
        provider={provider}
        handleClaim={(address, provider) => handleClaim(address, provider)}
        gsapOutBlocks={() => gsapOutBlocks()}
      />}
    </section>
  )
}