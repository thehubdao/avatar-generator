import Image from "next/image";
import Button from "./button.ui";
import PlusSVG from "./SVG/plusSVG.ui";
import { useState } from "react";
import DownloadSVG from "./SVG/downloadSVG.ui";
import Modal from "./modal.ui";

export default function DetailsUI() {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
              <Button className="w-full" label="Download" handleClick={() => { setIsModalOpen(true) }} light withIcon>
                <DownloadSVG />
              </Button>
            </div>
          </>
          :
          <Button label="/// details" withIcon handleClick={() => { setIsOpen(true) }} className="w-full" textStiles="text-start pl-2">
            <PlusSVG />
          </Button>
      }
      {isModalOpen &&
        <Modal handleClose={() => setIsModalOpen(false)}>
          <div className="grid justify-items-center">
            <div className="text-center text-white grid gap-4">
              <p className="font-bold text-2xl">Select Download Type</p>
              <p className="text-lg">and experience the 3D Web</p>
            </div>
            <div className="grid gap-4 pt-8">
              <Button label="Download VRM" light handleClick={() => { }} />
              <Button label="Download GLB" light handleClick={() => { }} />
              <Button label="Download PNG" light handleClick={() => { }} />
            </div>
          </div>
        </Modal>
      }
    </div>
  )
}