import Image from "next/image";
import { useEffect, useRef } from "react";
import TransparentBox from "../../common/transparentBox.ui";
import { moveHorizontalBlocks } from "../../../utils/gsap/block_in_out";

interface MainLuksoSectionUIProps {
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>
}

export default function MainLuksoSectionUI({ setCurrentSection }: MainLuksoSectionUIProps) {
  const luksoAvatarRef = useRef<HTMLDivElement>(null);
  const exclusiveCollectionRef = useRef<HTMLDivElement>(null);
  const ANIMATION_DURATION = 0.5;

  const gsapEnterBlocks = () => {
    if (!luksoAvatarRef.current || !exclusiveCollectionRef.current) return
    moveHorizontalBlocks(luksoAvatarRef.current, ANIMATION_DURATION, 'left', 'in');
    moveHorizontalBlocks(exclusiveCollectionRef.current, ANIMATION_DURATION, 'right', 'in');
  }

  const gsapOutBlocks = () => {
    if (!luksoAvatarRef.current || !exclusiveCollectionRef.current) return
    moveHorizontalBlocks(luksoAvatarRef.current, ANIMATION_DURATION, 'left', 'out');
    moveHorizontalBlocks(exclusiveCollectionRef.current, ANIMATION_DURATION, 'right', 'out', () => setCurrentSection(1));
  }

  useEffect(() => { gsapEnterBlocks(); }, [])

  return (
    <section className={`flex h-full items-center justify-between`}>
      {/* Lukso Avatars */}
      <div className="w-[688px] h-[70%] flex flex-col gap-3" ref={luksoAvatarRef}>
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
        >
          <Image
            src={'/resources/images/campaings/full-avatar-lukso.png'}
            width={548}
            height={308}
            alt="lukso avatar full body view"
          />
          <h2 className="font-extrabold text-4xl pt-5">LUKSO AVATARS</h2>
          <p className="text-center mx-20 pt-2">A new batch of wearables have been added to the THE HUB Heroes pool. You will find new traits when rerolling from now on. Let the fun continue!</p>
        </TransparentBox>

        <button className="w-full h-fit" onClick={() => gsapOutBlocks()}>
          <TransparentBox
            fullWidth
            border
            backgroundColorClass="bg-white"
            heightClass="h-[85px]"
          >
            <p className="text-black text-xl">Roll your Avatar <span>(icon)</span></p>
          </TransparentBox>
        </button>

      </div>

      {/* Exclusive collection */}
      <div className="flex h-[70%] gap-3" ref={exclusiveCollectionRef}>
        <div className="w-[345px] h-full flex flex-col">
          <TransparentBox
            fullWidth
            border
            borderSizeClass="border-b-0"
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="h-[125px]"
          >
            <h3 className="font-extrabold text-2xl">EXCLUSIVE COLLECTION</h3>
            <p>Reamining: 15380</p>
          </TransparentBox>
          <TransparentBox
            fullWidth
            border
            borderSizeClass="border-b-0"
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="grow"
          >
            <h3 className="font-semibold text-2xl">Features</h3>
            <div className="mt-5 text-lg underline">
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
            <h3 className="font-semibold text-2xl">Deluxe Avatars</h3>
            <div className="mt-5 text-lg underline">
              <p>Golden</p>
              <p>Silver</p>
              <p>Bronce</p>
            </div>
          </TransparentBox>
        </div>

        <div className="w-[345px] flex">
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
            <p className="grow flex items-center mx-14">Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.</p>
          </TransparentBox>
        </div>
      </div>
    </section>
  )
}
