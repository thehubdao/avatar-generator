import Image from "next/image";
import Button from "./button.ui";
import PlusSVG from "./SVG/plusSVG.ui";
import { useState } from "react";
import DownloadSVG from "./SVG/downloadSVG.ui";
import Modal from "./modal.ui";
import { IndexFeatureInterface } from "../../../interfaces/api.interface";
import { useSnackbar } from "../snackbar/snackbar.provider";

interface DetailsUIProps {
  data: IndexFeatureInterface[];
  handleDownload: () => Promise<void>;
  imgUrl: string;
  loading?: boolean;
}

export default function DetailsUI({ data, handleDownload, imgUrl, loading = false }: DetailsUIProps) {
  const { showSnackbar } = useSnackbar();

  const [isOpen, setIsOpen] = useState<boolean>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [isLoadedImage, setIsLoadedImage] = useState<boolean>();

  const handleDownloadingSnackbar = () => {
    showSnackbar(
      <p>Your Citizen is being downloaded, please wait...</p>
    );
  }

  return <>
    {
      isOpen && !loading &&
      <div className="fixed top-24 md:top-auto md:bottom-4 md:left-4 w-full md:w-[419px] px-6 md:px-0">
        <div className="max-h-[64vh] md:max-h-[70vh] 2xl:max-h-[90vh] bg-citizens-dark shadow-citizens-btn w-full rounded-[20px] mb-4 pr-2 pl-4 text-white overflow-auto">
          <div className="sticky top-0 flex z-10 bg-citizens-dark py-2">
            <p className={`font-light text-lg text-white uppercase grow`}>&#47;&#47;&#47; details</p>
            <div className="w-10 h-[27px] border border-white rounded-full flex justify-center items-center cursor-pointer" onClick={() => setIsOpen(false)}>
              <div className="w-[14px] h-[2px] bg-white" />
            </div>
          </div>
          <div className="w-full px-7 pb-9 pt-7">
            <div className="relative w-full h-[30vh] md:h-[300px] rounded-2xl overflow-hidden shadow-citizens-img">
              <Image src={imgUrl} alt={'Avatar detail'} fill className={`object-cover ${isLoadedImage ? 'opacity-100' : 'opacity-0'} transition-opacity`} onLoadingComplete={(img) => {
                if (img) setIsLoadedImage(true);
              }} />
              {
                !isLoadedImage &&
                <div className="absolute w-8 h-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-full h-full rounded-full border-t-2 border-white animate-spin" />
                </div>
              }
            </div>
          </div>
          <div className="grid grid-cols-2 justify-items-center gap-4 px-8 pb-8">
            {
              data.map((item, index) => (
                <div key={index} className="grid justify-items-center text-sm">
                  <h3 className="uppercase">{item.val.type}</h3>
                  <p className="capitalize">{item.val.name}</p>
                </div>
              ))
            }
          </div>
        </div>
        <div className="w-full gap-4 flex">
          <Button className="w-full" label="Download files" handleClick={() => { setIsModalOpen(true) }} light withIcon>
            <DownloadSVG />
          </Button>
        </div>
      </div>
    }
    {!isOpen &&
      <Button label="/// details" withIcon handleClick={() => { setIsOpen(true) }} className="fixed bottom-4 left-4 min-w-fit lg:w-[419px]" textStiles="text-start text-sm lg:text-lg lg:pl-2">
        {loading ?
          <div className="w-3 h-3 rounded-full border-t-[1px] border-white animate-spin" />
          :
          <PlusSVG />
        }
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
            <Button label="Download VRM" light handleClick={() => {
              handleDownload();
              handleDownloadingSnackbar();
            }} />
            <Button label="Download GLB" light handleClick={() => { }} />
            <Button label="Download PNG" light handleClick={() => { }} />
          </div>
        </div>
      </Modal>
    }
  </>
}