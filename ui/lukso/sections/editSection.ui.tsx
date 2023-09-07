import Image from "next/image"
import { Fragment, useEffect, useRef } from "react"
import TransparentBox from "../../common/transparentBox.ui"
import { moveHorizontalBlocks } from "../../../utils/gsap/block_in_out";

export default function EditLuksoSectionUI() {
  const editAvatarRef = useRef<HTMLDivElement>(null);
  const ANIMATION_DURATION = 0.5;

  const gsapEnterBlocks = () => {
    if (!editAvatarRef.current) return
    moveHorizontalBlocks(editAvatarRef.current, ANIMATION_DURATION, 'left', 'in');
  }

  useEffect(() => { gsapEnterBlocks(); }, [])

  return (
    <section className={`flex h-full items-center justify-between`}>
      {/* Edit Avatar */}
      <div className="w-[461px] h-full flex flex-col" ref={editAvatarRef}>
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
          borderSizeClass="border-t-0 border-b-0"
        >
          <Image
            src={'/resources/images/campaings/close-avatar-lukso.png'}
            width={347}
            height={301}
            alt="lukso avatar selfie view"
          />
          <div className="grid grid-cols-2 mt-20 gap-4 gap-x-14">
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
            <p className="text-black text-xl ">World Color <span>(0x00f)</span></p>
          </TransparentBox>
        </TransparentBox>
        <div className="h-20 flex whitespace-nowrap">
          <TransparentBox fullWidth border backgroundColorClass="bg-white">
            <p className="text-black text-xl ">Download <span>(icon)</span></p>
          </TransparentBox>
          <TransparentBox border backgroundColorClass="bg-white">
            <p className="text-black text-xl ">Edit <span>(icon)</span></p>
          </TransparentBox>
        </div>
      </div>
    </section>
  )
}