import { Fragment } from "react"
import TransparentBox from "../../common/transparentBox.ui"
import Image from "next/image"

export default function MintLuksoSectionUI({ hidden }: { hidden?: boolean }) {
  const hiddenClass = hidden ? 'hidden' : 'flex'

  return (
    <section className={`${hiddenClass} h-full items-center justify-between`}>
      {/* Mint features */}
      <div className="w-[461px] h-full flex flex-col gap-3">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
          borderSizeClass="border-t-0"
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
      </div>

      {/* Buttons */}
      <div className="flex flex-col w-[240px] h-[70%] justify-end gap-3 text-black text-xl">
        <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
          <p>Reroll <span>(icon)</span></p>
        </TransparentBox>
        <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
          <p>Claim <span>(icon)</span></p>
        </TransparentBox>
      </div>

      {/* Mint your avatar */}
      <div className="w-[564px] h-[70%]">
        <TransparentBox fullWidth border backgroundColorClass="bg-[#FFCBDE]" paddingClass="px-28" aditionalClass="gap-8">
          <h3 className="font-semibold text-2xl mb-20">MINT YOUR AVATAR</h3>
          <p className="text-lg">Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.
            Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.</p>
          <div>(Social media section)</div>
          <div className="font-semibold">
            <p>PUBLIC MINT</p>
            <p>0.03 ETH</p>
          </div>
        </TransparentBox>
      </div>

    </section>
  )
}