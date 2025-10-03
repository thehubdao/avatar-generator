import Image from "next/image";
import { useState } from "react";
import SocialButtons from "./socialButtons.ui";
import Button from "./button.ui";
import ArrowMintSVG from "./SVG/arrowMintSVG.ui";
import Modal from "./modal.ui";
import Loader from "../../lukso/common/loader.ui";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setMintingMode } from "../../../store/citizensMetadataSlice";
import PlusSVG from "./SVG/plusSVG.ui";
import { useMediaQuery } from "usehooks-ts";
import Counter from "./counter.ui";
import { MINTING_TARGET_DATE } from "../../../constants/citizens.constant";
import { MintUIResult } from "../../../interfaces/common.interface";
import FaceSMileSVG from "./SVG/faceSmileSVG.ui";
import FaceSadSVG from "./SVG/faceSadSVG.ui";
import { Campaign } from "../../../types/citizens.type";

interface MintUIProps {
  imgUrl?: string;
  avatarDescription?: string;
  campaignName?: string;
  campaignDescription?: string;
  price?: number;
  supply?: number;
  onMinting: () => Promise<MintUIResult>;
}

export default function MintUI({
  imgUrl = '',
  avatarDescription,
  campaignName,
  campaignDescription,
  price,
  supply,
  onMinting }: MintUIProps) {
  const [isLoadedImage, setIsLoadedImage] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isMinted, setIsMinted] = useState<boolean | null>(null);
  const [mintedMessage, setMintedMessage] = useState<string | null>(null);

  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isMintOpen, setIsMintOpen] = useState<boolean>(false);

  const [isMintingAllowed, setIsMintingAllowed] = useState<boolean>(false);

  const selectedCampaign = useAppSelector((state) => state.citizensMetadata.selectedCampaign);

  const dispatch = useAppDispatch();

  const mintingSupply = useAppSelector((state) => state.citizensMetadata.mintSupply);
  const mintingPrice = useAppSelector((state) => state.citizensMetadata.mintingPrice);
  const isHolder = useAppSelector((state) => state.citizensAuth.isHolder);

  const isMatchMobile = useMediaQuery('(max-width: 1024px)');

  async function handleMint() {
    setIsMinting(true);
    const result = await onMinting();
    setIsMinted(result.success);
    setMintedMessage(result.message);
  }

  function handleButtonClick(type: 'info' | 'mint') {
    if (type === 'info') {
      setIsInfoOpen(!isInfoOpen);
      setIsMintOpen(false);
    }
    if (type === 'mint') {
      setIsMintOpen(!isMintOpen);
      setIsInfoOpen(false);
    }
  }

  function handleTimeReachedZero() {
    setIsMintingAllowed(true);
  }

  return (
    <>
      {!isModalOpen &&
        <>
          {/* AVATAR DESCRIPTION */}
          <div className={`${isMatchMobile ? (isInfoOpen ? 'block' : 'hidden') : ''} fixed bottom-20 lg:bottom-6 xl:bottom-auto top-auto xl:top-24 left-6 w-[326px] sm:w-[462px] h-fit min-h-[55dvh] xl:h-[75dvh] 2xl:h-[85dvh] bg-citizens-dark shadow-citizens-btn rounded-[20px] p-8 2xl:p-12 text-white overflow-auto`}>
            <div className="w-full pb-8">
              <div className="relative w-full h-[30vh] lg:h-[250px] 2xl:h-[300px] rounded-2xl overflow-hidden shadow-citizens-img">
                <Image
                  priority
                  src={imgUrl}
                  alt={'Avatar detail'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`object-cover ${isLoadedImage ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                  onLoadingComplete={(img) => {
                    if (img) setIsLoadedImage(true);
                  }}
                />
                {
                  !isLoadedImage &&
                  <div className="absolute w-8 h-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-full h-full rounded-full border-t-2 border-white animate-spin" />
                  </div>
                }
              </div>
            </div>
            <div>
              <p className="text-center text-xs xl:text-base 2xl:text-xl">{avatarDescription}</p>
            </div>
          </div >
          {/* CAMPAIGN DESCRIPTION */}
          <div className={`${isMatchMobile ? (isMintOpen ? 'block' : 'hidden') : ''} fixed bottom-20 lg:bottom-6 xl:bottom-auto top-auto xl:top-24 right-6 w-[326px] sm:w-[462px] h-fit min-h-[55dvh] xl:h-[75dvh] 2xl:h-[85dvh] bg-citizens-dark shadow-citizens-btn rounded-[20px] p-8 2xl:p-12 text-white overflow-auto`} >
            <div className="relative h-full flex flex-col justify-between gap-4 xl:gap-0 2xl:py-16">
              <h1 className="text-center text-2xl font-semibold">
                {campaignName}
              </h1>
              <p className="block text-center text-xs xl:text-base">
                {campaignDescription}
              </p>
              <SocialButtons className='w-full flex justify-center gap-4 scale-75 order-4 xl:order-none' />
              <div className="text-center font-semibold">
                <p className="xl:text-lg">{isHolder ? 'FREE MINT' : 'PUBLIC MINT'}</p>
                <p><span className="font-light text-sm">{isHolder ? 'Platform fee: ' : ''}</span>{price || mintingPrice?.mintPrice} {mintingPrice?.mintingPriceSymbol}</p>
              </div>
              <div className="xl:hidden w-full flex flex-col items-center" >
                {isMintingAllowed ?
                  <>
                    <Button label="Mint" withIcon light handleClick={() => { setIsModalOpen(true) }} textStyles="text-start text-xl px-8">
                      <div className="pr-8">
                        <ArrowMintSVG />
                      </div>
                    </Button>
                    <p className="font-medium text-center pt-4 text-white">Current Supply: {supply || mintingSupply}</p>
                  </>
                  :
                  <Counter onReachZero={() => handleTimeReachedZero()} targetDate={MINTING_TARGET_DATE[selectedCampaign as Campaign]} />}
              </div >
            </div>
          </div >
          {/* UI BUTTONS MOBILE */}
          <div className="fixed lg:hidden bottom-6 xl:bottom-auto top-auto xl:top-24 left-6 xl:right-6 w-40 bg-citizens-dark shadow-citizens-btn rounded-[20px] py-2 px-4" onClick={() => handleButtonClick('info')}>
            <div className="flex z-10">
              <p className={`font-light text-lg text-white uppercase grow`}>&#47;&#47;&#47; INFO</p>
              <div className="w-10 h-[27px] border border-white rounded-full flex justify-center items-center cursor-pointer">
                {isInfoOpen ?
                  <div className="w-[14px] h-[2px] bg-white" />
                  :
                  <PlusSVG />
                }
              </div>
            </div>
          </div >
          <div className="fixed lg:hidden bottom-6 xl:bottom-auto top-auto xl:top-24 right-6 xl:right-6 w-40 bg-citizens-dark shadow-citizens-btn rounded-[20px] py-2 px-4" onClick={() => handleButtonClick('mint')}>
            <div className="flex z-10">
              <p className={`font-light text-lg text-white uppercase grow`}>&#47;&#47;&#47; MINT</p>
              <div className="w-10 h-[27px] border border-white rounded-full flex justify-center items-center cursor-pointer">
                {isMintOpen ?
                  <div className="w-[14px] h-[2px] bg-white" />
                  :
                  <PlusSVG />
                }
              </div>
            </div>
          </div >
          {/* MINT BUTTON */}
          < div className="hidden xl:block fixed bottom-6 left-1/2 -translate-x-1/2"  >
            {isMintingAllowed ?
              <>
                <Button label="Mint" withIcon light handleClick={() => { setIsModalOpen(true) }} textStyles="text-start text-xl px-8">
                  <div className="pr-8">
                    <ArrowMintSVG />
                  </div>
                </Button>
                <p className="font-medium text-center pt-4 text-white">Current Supply: {supply || mintingSupply}</p>
              </>
              :
              <Counter onReachZero={() => handleTimeReachedZero()} targetDate={MINTING_TARGET_DATE[selectedCampaign as Campaign]} />
            }
          </div >
        </>
      }
      {
        isModalOpen && !isMinting &&
        <Modal modalStyles="min-h-fit w-[80vw] sm:w-[60vw]" handleClose={() => setIsModalOpen(false)}>
          <div className="grid justify-items-center">
            <div className="text-center text-white grid gap-4">
              <p className="font-bold text-2xl">Claim your citizen</p>
              <p className="text-lg">Are you sure that you want to claim this citizen?</p>
            </div>
            <div className="flex gap-4 pt-8">
              <Button label="Go Back" light handleClick={() => { setIsModalOpen(false) }} />
              <Button label="Claim" light handleClick={() => handleMint()} />
            </div>
          </div>
        </Modal>
      }
      {
        isModalOpen && isMinting && isMinted === null &&
        <Modal modalStyles="min-h-fit w-[80vw] sm:w-[60vw]" handleClose={() => { }}>
          <div className="grid justify-items-center">
            <Loader size={69} />
            <div className="text-center text-white grid gap-4 pt-4">
              <p className="text-lg">Synthesizing your unique digital genome...<br />Your custom avatar is being created!</p>
            </div>
          </div>
        </Modal>
      }
      {
        isMinted !== null &&
        <Modal modalStyles="min-h-fit w-[80vw] sm:w-[500px]" handleClose={() => {
          if (isMinted) dispatch(setMintingMode(false));
          else {
            setIsMinted(null);
            setIsModalOpen(false);
            setIsMinting(false);
          }
        }}>
          <div className="grid justify-items-center">
            {isMinted ? <FaceSMileSVG /> : <FaceSadSVG />}
            <div className="text-center text-white grid gap-2 py-4 px-2">
              <p className="font-semibold text-2xl">{isMinted ? 'Congratulations!' : 'Error!'}</p>
              <p className="text-xl">{mintedMessage}</p>
            </div>
          </div>
        </Modal>
      }
    </>
  )
}

