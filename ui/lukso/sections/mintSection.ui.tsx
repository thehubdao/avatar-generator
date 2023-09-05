import { Fragment } from "react"
import TransparentBox from "../../common/transparentBox.ui"

export default function MintLuksoSectionUI() {
  return (
    <section className="h-full flex items-center justify-between hidden">
      {/* Mint features */}
      <div className="w-[461px] h-full flex flex-col gap-3">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
          borderSizeClass="border-t-0"
        >
          <h2>Image</h2>
          <div className="grid grid-cols-2">
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
          <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
            <p>World Color <span>0x00f</span></p>
          </TransparentBox>
        </TransparentBox>
      </div>

      {/* Buttons */}
      <div className="flex flex-col w-[240px] h-[70%] justify-end gap-3">
        <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
          <p>Reroll <span>icon</span></p>
        </TransparentBox>
        <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
          <p>Claim <span>icon</span></p>
        </TransparentBox>
      </div>

      {/* Mint your avatar */}
      <div className="w-[564px] h-[70%]">
        <TransparentBox fullWidth border backgroundColorClass="bg-[#FFCBDE]" >
          <h3>MINT YOUR AVATAR</h3>
          <p>Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.
            Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.</p>
          <div>Social media section</div>
          <p>PUBLIC MINT</p>
          <p>0.03 ETH</p>
        </TransparentBox>
      </div>

    </section>
  )
}