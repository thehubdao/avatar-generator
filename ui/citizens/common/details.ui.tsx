import Image from "next/image";
import Button from "./button.ui";
import PlusSVG from "./SVG/plusSVG.ui";
import { useState } from "react";
import DownloadSVG from "./SVG/downloadSVG.ui";

export default function DetailsUI() {
  const [isOpen, setIsOpen] = useState<boolean>();
  return (
    <div className="fixed bottom-8 left-4 w-[419px]">
      {
        isOpen ?
          <>
            <div className="max-h-[70vh] 2xl:max-h-[90vh] bg-citizens-dark shadow-citizens-btn w-full rounded-[20px] mb-4 p-2 pl-4 text-white overflow-auto">
              <div className="flex">
                <p className={`font-light text-lg text-white uppercase grow`}>&#47;&#47;&#47; details</p>
                <div className="w-10 h-[27px] border border-white rounded-full flex justify-center items-center cursor-pointer" onClick={() => setIsOpen(false)}>
                  <div className="w-[14px] h-[2px] bg-white" />
                </div>
              </div>
              <div className="w-full px-7 py-9">
                <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-citizens-img">
                  <Image src={'https://lipsum.app/random/280x300/'} alt={'Avatar detail'} fill className="object-cover" />
                </div>
              </div>
              <div className="grid grid-cols-2 justify-items-center gap-4 px-8 pb-8">
                <div className="grid justify-items-center">
                  <h3 className="uppercase">TOP</h3>
                  <p className="capitalize">Information</p>
                </div>
                <div className="grid justify-items-center">
                  <h3 className="uppercase">TOP</h3>
                  <p className="capitalize">Information</p>
                </div>
                <div className="grid justify-items-center">
                  <h3 className="uppercase">TOP</h3>
                  <p className="capitalize">Information</p>
                </div>
                <div className="grid justify-items-center">
                  <h3 className="uppercase">TOP</h3>
                  <p className="capitalize">Information</p>
                </div>
                <div className="grid justify-items-center">
                  <h3 className="uppercase">TOP</h3>
                  <p className="capitalize">Information</p>
                </div>
                <div className="grid justify-items-center">
                  <h3 className="uppercase">TOP</h3>
                  <p className="capitalize">Information</p>
                </div>
                <div className="grid justify-items-center">
                  <h3 className="uppercase">TOP</h3>
                  <p className="capitalize">Information</p>
                </div>
                <div className="grid justify-items-center">
                  <h3 className="uppercase">TOP</h3>
                  <p className="capitalize">Information</p>
                </div>
              </div>
            </div>
            <div className="w-full gap-4 flex">
              <Button className="w-full" label="Download" handleClick={() => {}} light withIcon>
                <DownloadSVG />
              </Button>
              <Button className="px-8" label="Backpack" handleClick={() => {}} light textStiles="w-full text-center"/>
            </div>
          </>
          :
          <Button label="/// details" withIcon handleClick={() => { setIsOpen(true) }} className="w-full" textStiles="text-start pl-2">
            <PlusSVG />
          </Button>
      }

    </div>
  )
}