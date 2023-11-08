import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import TransparentBox from "../common/transparentBox.ui";
import { translationInOutBlock } from "../../../utils/gsap/block_in_out.util";
import { FaDice } from "react-icons/fa6";
import { LuksoSections } from "../../../enums/lukso/common.enum";
import { DURATION_ANIMATION_SECTION } from "../../../constants/lukso/animation.constant";

interface MainSectionUIProps {
  setCurrentSection: (value: LuksoSections) => void;
}

export default function MainSectionUI({ setCurrentSection }: MainSectionUIProps) {
  const luksoAvatarRef = useRef<HTMLDivElement>(null);
  const exclusiveCollectionRef = useRef<HTMLDivElement>(null);

  const gsapEnterBlocks = () => {
    if (!luksoAvatarRef.current || !exclusiveCollectionRef.current) return
    translationInOutBlock(luksoAvatarRef.current, DURATION_ANIMATION_SECTION);
    translationInOutBlock(exclusiveCollectionRef.current, DURATION_ANIMATION_SECTION);
  }

  const gsapOutBlocks = () => {
    if (!luksoAvatarRef.current || !exclusiveCollectionRef.current) return
    translationInOutBlock(luksoAvatarRef.current, DURATION_ANIMATION_SECTION, true);
    translationInOutBlock(exclusiveCollectionRef.current, DURATION_ANIMATION_SECTION, true, true, () => setCurrentSection(LuksoSections.Mint));
  }

  useLayoutEffect(() => { void gsapEnterBlocks() }, [])

  return (
    <section className={`flex h-full items-center justify-between`}>
      {/* Lukso Avatars */}
      <div ref={luksoAvatarRef} className="w-[580px] 2xl:w-[688px] -translate-x-full h-[70%] flex flex-col gap-3">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
          paddingClass="py-3"
        >
          <div className="relative w-[328px] 2xl:w-[548px] h-[184px] 2xl:h-[308px]">
            <Image
              src={'/resources/images/campaings/full-avatar-lukso.png'}
              fill
              alt="lukso avatar full body view"
            />
          </div>
          <h2 className="font-extrabold text-2xl 2xl:text-4xl pt-5">LUKSO AVATARS</h2>
          <p className="text-center text-sm 2xl:text-base mx-20 pt-2">A new batch of wearables have been added to the THE HUB Heroes pool. You will find new traits when rerolling from now on. Let the fun continue!</p>
        </TransparentBox>

        <button className="w-full h-fit" onClick={() => void gsapOutBlocks()}>
          <TransparentBox
            fullWidth
            border
            backgroundColorClass="bg-white"
            heightClass="h-[70px] 2xl:h-[85px]"
            aditionalClass="flex-row"
          >
            <div className="flex items-center gap-3">
              <p className="text-black text-lg 2xl:text-xl">Roll your Avatar </p>
              <FaDice className="text-black text-2xl" />
            </div>
          </TransparentBox>
        </button>
      </div>

      {/* Exclusive collection */}
      <div ref={exclusiveCollectionRef} className="flex h-[70%] gap-3 translate-x-full">
        <div className="w-[280px] 2xl:w-[345px] h-full flex flex-col">
          <TransparentBox
            fullWidth
            border
            borderSizeClass="border-b-0"
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="h-[125px]"
          >
            <h3 className="font-extrabold text-xl 2xl:text-2xl">EXCLUSIVE COLLECTION</h3>
            <p className="text-sm 2xl:text-base">Reamining: 15380</p>
          </TransparentBox>
          <TransparentBox
            fullWidth
            border
            borderSizeClass="border-b-0"
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="grow"
          >
            <h3 className="font-semibold text-xl 2xl:text-2xl">Features</h3>
            <div className="mt-5 text-base 2xl:text-lg underline">
              <p>Feature one</p>
              <p>Feature two</p>
              <p>Feature three</p>
            </div>
          </TransparentBox>
          <TransparentBox
            fullWidth
            border
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="grow"
          >
            <h3 className="font-semibold text-xl 2xl:text-2xl">Deluxe Avatars</h3>
            <div className="mt-5 text-base 2xl:text-lg underline">
              <p>Golden</p>
              <p>Silver</p>
              <p>Bronce</p>
            </div>
          </TransparentBox>
        </div>

        <div className="w-[280px] 2xl:w-[345px] flex">
          <TransparentBox
            fullWidth
            border
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="grow"
            paddingClass="px-0"
            justifyClass="justify-start"
          >
            <Image
              src={'/resources/images/campaings/close-avatar-lukso-without-borders.png'}
              width={345}
              height={380}
              alt="lukso avatar selfie view"
            />
            <p className="grow flex items-center text-sm 2xl:text-base mx-10 2xl:mx-14">{`Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.`}</p>
          </TransparentBox>
        </div>
      </div>
    </section>
  )
}
