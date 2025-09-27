import Image from "next/image";
import Button from "./button.ui";
import PlusSVG from "./SVG/plusSVG.ui";
import { useState } from "react";
import DownloadSVG from "./SVG/downloadSVG.ui";
import Modal from "./modal.ui";
import { IndexFeatureInterface } from "../../../interfaces/api.interface";
import { useSnackbar } from "../snackbar/snackbar.provider";
import { ModelExtension } from "../../../enums/export.enum";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setShoppingCart } from "../../../store/citizensMetadataSlice";

interface DetailsUIProps {
  data: IndexFeatureInterface[];
  handleDownload: (type: ModelExtension) => Promise<boolean>;
  onResetCombination: () => void;
  imgUrl: string;
  loading?: boolean;
}

export default function DetailsUI({ data, handleDownload, imgUrl, loading = false, onResetCombination }: DetailsUIProps) {
  const shoppingCart = useAppSelector(state => state.citizensMetadata.shoppingCart);
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();

  const [isOpen, setIsOpen] = useState<boolean>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleDownloading = async (type: ModelExtension) => {
    showSnackbar(
      <p>Your {type} is being downloaded, please wait...</p>
    );

    const isSuccess = await handleDownload(type);

    if (!isSuccess) {
      showSnackbar(
        <p>Ups, an error has occurred, try later.</p>
      );
    }
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
            <div className="relative w-full max-w-[350px] h-[350px] mx-auto rounded-2xl overflow-hidden shadow-citizens-img">
              <Image
                src={imgUrl}
                alt={'Avatar detail'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover ${!loading ? 'opacity-100' : 'opacity-0'} transition-opacity`}
              />
              {
                loading &&
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
                  <h3 className="font-bold uppercase w-full truncate text-center text-citizens-blue">{item.val.type}</h3>
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
      <Button 
        label="/// details" 
        withIcon 
        handleClick={loading ? () => {} : () => { setIsOpen(true) }} 
        className={`fixed bottom-4 left-4 min-w-fit lg:w-[419px] ${loading ? 'cursor-not-allowed opacity-75 pointer-events-none' : 'cursor-pointer'}`} 
        textStyles="text-start text-sm lg:text-lg lg:pl-2"
      >
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
          {shoppingCart !== null && shoppingCart.length > 0 ?
            <>
              <div className="text-center text-white grid gap-4">
                <p className="font-bold text-2xl">Shopping Process</p>
                <p className="text-lg">You have items in the cart, <br />please proceed to checkout.</p>
              </div>
              <div className="grid gap-4 pt-8">
                <Button label="Continue checkout" light handleClick={() => {
                  setIsModalOpen(false);
                }} />
                <Button label="Clean cart" light handleClick={() => {
                  dispatch(setShoppingCart([]));
                  onResetCombination();
                }} />
              </div>
            </>
            :
            <>
              <div className="text-center text-white grid gap-4">
                <p className="font-bold text-2xl">Select Download Type</p>
                <p className="text-lg">and experience the 3D Web</p>
              </div>
              <div className="grid gap-4 pt-8">
                <Button label="Download VRM" light handleClick={() => {
                  handleDownloading(ModelExtension.VRM);
                }} />
                <Button label="Download GLB" light handleClick={() => {
                  handleDownloading(ModelExtension.GLB);
                }} />
                <Button label="Download PNG" light handleClick={() => {
                  handleDownloading(ModelExtension.PNG);
                }} />
              </div>
            </>
          }
        </div>
      </Modal>
    }
  </>
}