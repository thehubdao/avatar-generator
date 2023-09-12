import Link from "next/link";
import Image from "next/image"
import { Fragment, useEffect, useRef } from "react"
import TransparentBox from "../../common/transparentBox.ui"
import { moveHorizontalBlocks, moveVerticalBlocks } from "../../../utils/gsap/block_in_out";

interface MintLuksoSectionUIProps {
  socialMedia: { alt: string, link: string, icon: React.ReactElement }[],
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>,
}

export default function MintLuksoSectionUI({ socialMedia, setCurrentSection }: MintLuksoSectionUIProps) {
  const mainFeatureRef = useRef<HTMLDivElement>(null);
  const mintAvatarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const ANIMATION_DURATION = 0.5;

  const gsapEnterBlocks = () => {
    if (!mainFeatureRef.current || !mintAvatarRef.current || !buttonRef.current) return
    moveHorizontalBlocks(mainFeatureRef.current, ANIMATION_DURATION, 'left', 'in');
    moveHorizontalBlocks(mintAvatarRef.current, ANIMATION_DURATION, 'right', 'in');
    moveVerticalBlocks(buttonRef.current, ANIMATION_DURATION, 'bottom', 'in');
  }

  const gsapOutBlocks = () => {
    if (!mainFeatureRef.current || !mintAvatarRef.current || !buttonRef.current) return
    moveHorizontalBlocks(mainFeatureRef.current, ANIMATION_DURATION, 'left', 'out');
    moveHorizontalBlocks(mintAvatarRef.current, ANIMATION_DURATION, 'right', 'out', () => setCurrentSection(2));
    moveVerticalBlocks(buttonRef.current, ANIMATION_DURATION, 'bottom', 'out');
  }

  useEffect(() => { gsapEnterBlocks(); }, [])

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

      {/* Buttons */}
      <div className="flex flex-col w-[240px] h-[70%] justify-end gap-3 text-black text-lg 2xl:text-xl" ref={buttonRef}>
        <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
          <p>Reroll <span>(icon)</span></p>
        </TransparentBox>
        <button className="w-full h-fit" onClick={() => gsapOutBlocks()}>
          <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
            <p>Claim <span>(icon)</span></p>
          </TransparentBox>
        </button>
      </div>

      {/* Mint your avatar */}
      <div className="w-[460px] 2xl:w-[564px] h-[70%]" ref={mintAvatarRef}>
        <TransparentBox fullWidth border backgroundColorClass="bg-[#FFCBDE]" paddingClass="px-14 2xl:px-28" aditionalClass="gap-6 2xl:gap-8">
          <h3 className="font-semibold  text-xl 2xl:text-2xl mb-10 2xl:mb-20">MINT YOUR AVATAR</h3>
          <p className="text-base 2xl:text-lg">Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.
            Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.</p>
          <div className="flex gap-3">
            {socialMedia.map((item, index) => {
              return <Link key={index} href={item.link} target="_blank">
                {item.icon}
              </Link>
            })}
          </div>
          <div className="font-semibold">
            <p>PUBLIC MINT</p>
            <p>0.03 ETH</p>
          </div>
        </TransparentBox>
      </div>

    </section>
  )
}