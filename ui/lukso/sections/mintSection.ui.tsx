import Image from "next/image"
import { Fragment, useEffect, useRef, useState } from "react"
import TransparentBox from "../../common/transparentBox.ui"
import { moveHorizontalBlocks, moveVerticalBlocks } from "../../../utils/gsap/block_in_out";
import { BsArrowRepeat } from "react-icons/bs";
import { FaArrowRightLong } from "react-icons/fa6";
import SocialMediaButtonsLukso from "../common/socialMediaButtons.ui";

interface MintLuksoSectionUIProps {
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>;
  reRoll: () => Promise<void>;
}

export default function MintLuksoSectionUI({ setCurrentSection, reRoll }: MintLuksoSectionUIProps) {
  const mainFeatureRef = useRef<HTMLDivElement>(null);
  const mintAvatarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const ANIMATION_DURATION = 0.5;

  const [isRolling, setIsRolling] = useState<boolean>(false);

  const gsapEnterBlocks = async () => {
    if (!mainFeatureRef.current || !mintAvatarRef.current || !buttonRef.current) return
    await moveHorizontalBlocks(mainFeatureRef.current, ANIMATION_DURATION, 'left', 'in');
    await moveHorizontalBlocks(mintAvatarRef.current, ANIMATION_DURATION, 'right', 'in');
    await moveVerticalBlocks(buttonRef.current, ANIMATION_DURATION, 'bottom', 'in');
  }

  const gsapOutBlocks = async () => {
    if (!mainFeatureRef.current || !mintAvatarRef.current || !buttonRef.current) return
    await moveHorizontalBlocks(mainFeatureRef.current, ANIMATION_DURATION, 'left', 'out');
    await moveHorizontalBlocks(mintAvatarRef.current, ANIMATION_DURATION, 'right', 'out', () => setCurrentSection(2));
    await moveVerticalBlocks(buttonRef.current, ANIMATION_DURATION, 'bottom', 'out');
  }

  useEffect(() => { void gsapEnterBlocks(); }, [])

  const handleReRoll = async () => {
    if (isRolling) return;
    setIsRolling(true);
    await reRoll();
    setIsRolling(false);
  }

  return (
    <section className={`flex h-full items-center justify-between`}>
      {/* Mint features */}
      <div className="w-[360px] 2xl:w-[461px] h-full flex flex-col gap-3" ref={mainFeatureRef}>
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
          <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" aditionalClass="mt-10" >
            <p className="text-black text-lg 2xl:text-xl">World Color <span>(0x00f)</span></p>
          </TransparentBox>
        </TransparentBox>
      </div>

      {/** TODO: evitar que se sobreponga la seccion de bottones a el avatar */}
      {/* Buttons */}
      <div className="absolute bottom-[15%] left-1/2 -translate-x-[50%] flex flex-col w-[240px] justify-end gap-3 text-black text-lg 2xl:text-xl" ref={buttonRef}>
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
      <div className="w-[460px] 2xl:w-[564px] h-[70%]" ref={mintAvatarRef}>
        <TransparentBox fullWidth border backgroundColorClass="bg-[#FFCBDE]" paddingClass="px-14 2xl:px-28" aditionalClass="gap-6 2xl:gap-8">
          <h3 className="font-semibold  text-xl 2xl:text-2xl mb-10 2xl:mb-20">MINT YOUR AVATAR</h3>
          <p className="text-base 2xl:text-lg">{`Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.
            Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.`}</p>
          <SocialMediaButtonsLukso />
          <div className="font-semibold">
            <p>PUBLIC MINT</p>
            <p>0.03 ETH</p>
          </div>
        </TransparentBox>
      </div>

    </section>
  )
}