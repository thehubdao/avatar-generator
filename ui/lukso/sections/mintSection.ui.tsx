import Image from "next/image"
import { Fragment, useLayoutEffect, useRef, useState } from "react"
import TransparentBox from "../common/transparentBox.ui"
import { translationInOutBlock, fadeInOutBlock } from "../../../utils/gsap/block_in_out.util";
import { BsArrowRepeat } from "react-icons/bs";
import { FaArrowRightLong } from "react-icons/fa6";
import SocialButtonsUI from "../common/socialButtons.ui";
import { LuksoSections } from "../../../enums/lukso/common.enum";
import { DURATION_ANIMATION_SECTION } from "../../../constants/lukso/animation.constant";

interface MintSectionUIProps {
  setCurrentSection: (value: LuksoSections) => void;
  reRoll: () => Promise<void>;
}

export default function MintSectionUI({ setCurrentSection, reRoll }: MintSectionUIProps) {
  const mainFeatureRef = useRef<HTMLDivElement>(null);
  const mintAvatarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [isRolling, setIsRolling] = useState<boolean>(false);

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

  useLayoutEffect(() => { void gsapEnterBlocks(); }, [])

  const handleReRoll = async () => {
    if (isRolling) return;
    setIsRolling(true);
    await reRoll();
    setIsRolling(false);
  }

  return (
    <section className={`flex w-full h-full items-center justify-between`}>
      {/* Mint features */}
      <div ref={mainFeatureRef} className="w-[360px] 2xl:w-[461px] -translate-x-full h-full flex flex-col gap-3">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
          borderSizeClass="border-t-0"
        >
          <div className="relative w-[208px] 2xl:w-[347px] h-[180px] 2xl:h-[301px]">
            <Image
              src={'/resources/images/campaings/close-avatar-lukso.png'}
              fill
              alt="lukso avatar selfie view"
            />
          </div>
          <div className="grid grid-cols-2 mt-20 gap-4 gap-x-14 text-sm 2xl:text-base">
            {Array.from({ length: 4 }).map((_, index) => {
              return (<Fragment key={index}>
                <div>
                  <h3>TOP</h3>
                  <p>Information</p>
                </div>
                <div>
                  <h3>BUTTON</h3>
                  <p>Information</p>
                </div>
              </Fragment>)
            })}
          </div>
        </TransparentBox>
      </div>

      {/* Buttons */}
      <div ref={buttonRef} className="fixed bottom-[15%] left-1/2 -translate-x-[50%] flex flex-col w-[240px] justify-end gap-3 text-black text-lg 2xl:text-xl opacity-0">
        <button className="w-full h-fit" onClick={() => void handleReRoll()}>
          <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
            <div className="flex items-center gap-3">
              <p>{isRolling ? 'Rolling' : 'Reroll'}</p>
              <BsArrowRepeat className={`${isRolling ? 'rotate-180 transition-all duration-500' : ''}`} />
            </div>
          </TransparentBox>
        </button>
        <button className="w-full h-fit" onClick={() => void gsapOutBlocks()}>
          <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
            <div className="flex items-center gap-3">
              <p>Claim</p>
              <FaArrowRightLong className="text-base" />
            </div>
          </TransparentBox>
        </button>
      </div>

      {/* Mint your avatar */}
      <div ref={mintAvatarRef} className="w-[460px] 2xl:w-[564px] translate-x-full h-[70%]">
        <TransparentBox fullWidth border backgroundColorClass="bg-[#FFCBDE]" paddingClass="px-14 2xl:px-28" aditionalClass="gap-6 2xl:gap-8">
          <h3 className="font-semibold  text-xl 2xl:text-2xl mb-10 2xl:mb-20">MINT YOUR AVATAR</h3>
          <p className="text-base 2xl:text-lg">{`Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.
            Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.`}</p>
          <SocialButtonsUI />
          <div className="font-semibold">
            <p>PUBLIC MINT</p>
            <p>0.03 ETH</p>
          </div>
        </TransparentBox>
      </div>

    </section>
  )
}