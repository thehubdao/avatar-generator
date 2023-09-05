import TransparentBox from "../../common/transparentBox.ui";

export default function MainLuksoSectionUI() {
  return (
    <section className="h-full flex items-center justify-between ">
      {/* Lukso Avatars */}
      <div className="w-[688px] h-[70%] flex flex-col gap-3">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
        >
          <h2>LUKSO AVATARS</h2>
          <p>A new batch of wearables have been added to the THE HUB Heroes pool. You will find new traits when rerolling from now on. Let the fun continue!</p>
        </TransparentBox>

        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-white"
          heightClass="h-[85px]"
        >
          <p>Roll your Avatar</p>
        </TransparentBox>
      </div>

      {/* Exclusive collection */}
      <div className="flex h-[70%] gap-3">
        <div className="w-[345px] h-full flex flex-col">
          <TransparentBox
            fullWidth
            border
            borderSizeClass="border-b-0"
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="h-[125px]"
          >
            <h3>EXCLUSIVE COLLECTION</h3>
            <p>Reamining: 15380</p>
          </TransparentBox>
          <TransparentBox
            fullWidth
            border
            borderSizeClass="border-b-0"
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="grow"
          >
            <h3>Features</h3>
            <p>Feature one</p>
            <p>Feature two</p>
            <p>Feature three</p>
          </TransparentBox>
          <TransparentBox
            fullWidth
            border
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="grow"
          >
            <h3>Features</h3>
            <p>Feature one</p>
            <p>Feature two</p>
            <p>Feature three</p>
          </TransparentBox>
        </div>

        <div className="w-[345px] flex">
          <TransparentBox
            fullWidth
            border
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="grow"
          >
            <p>Heroes is THE HUB's genesis PFP collection. 5,000 Unique Interoperable Avatars on the Ethereum blockchain.</p>
          </TransparentBox>
        </div>
      </div>
    </section>
  )
}
