import TransparentBoxUI from "./transparentBox.ui";

export default function MintSectionModalUI() {
  return (
    <div className="z-10 bg-black bg-opacity-30 w-full h-screen fixed top-0 flex justify-center items-center">
      <TransparentBoxUI fullWidth border heightClass="h-fit min-h-[240px]" backgroundColorClass="bg-[#FFCBDE]">
        <div className="min-w-[515px] flex flex-col gap-4">
          <h3 className="text-2xl">Claim your citizen</h3>
          <p>Are you sure that you want to claim this citizen?</p>
          <div className="flex justify-between">
            <button className="w-52 h-fit" onClick={() => { }}>
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="text-black">Go Back</p>
                </div>
              </TransparentBoxUI>
            </button>
            <button className="w-52 h-fit" onClick={() => { alert('Claim') }}>
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="text-black">Claim</p>
                </div>
              </TransparentBoxUI>
            </button>
          </div>
        </div>
      </TransparentBoxUI>
    </div>
  )
}