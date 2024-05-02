import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import TransparentBox from "../common/transparentBox.ui";
import { translationInOutBlock } from "../../../utils/gsap/block_in_out.util";
import { FaDice } from "react-icons/fa6";
import { LuksoSections } from "../../../enums/lukso/common.enum";
import { DURATION_ANIMATION_SECTION } from "../../../constants/lukso/animation.constant";
import { ethers } from "ethers";
import ConnectModalUI from "../common/conectModal";
import { AiOutlineLoading } from "react-icons/ai";
import { FaWallet } from "react-icons/fa";
import Loader from "../common/loader.ui";
import { getSupply } from "../../../utils/web3/contract.util";
import { AVATAR_MAX_SUPPLY } from "../../../constants/common.constant";
import { useConnectWallet } from "@web3-onboard/react";
import { canMint } from "../../../utils/phase.util";
import LoginUI from "./loginSection.ui";

interface MainSectionUIProps {
  setCurrentSection: (value: LuksoSections) => void;
  hasMinted: boolean;
  provider: ethers.BrowserProvider | undefined;
  isGettingInfoAboutHasMinted: boolean;
  picture: string;
  combination: string;
}



export default function MainSectionUI({ setCurrentSection, hasMinted, provider, isGettingInfoAboutHasMinted, combination, picture }: MainSectionUIProps) {
  const luksoAvatarRef = useRef<HTMLDivElement>(null);
  const exclusiveCollectionRef = useRef<HTMLDivElement>(null);

  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const [avatarSupply, setAvatarSupply] = useState(0)

  const [{ wallet }] = useConnectWallet()

  const [canUserMint, setCanUserMint] = useState<boolean | undefined>()

  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    const setAvatarSupplyPromise = async () => {
      const supply = await getSupply()
      if (supply)
        setAvatarSupply(supply)
    }
    void setAvatarSupplyPromise()
  }, [])

  const gsapEnterBlocks = () => {
    if (!luksoAvatarRef.current || !exclusiveCollectionRef.current) return
    translationInOutBlock(luksoAvatarRef.current, DURATION_ANIMATION_SECTION);
    translationInOutBlock(exclusiveCollectionRef.current, DURATION_ANIMATION_SECTION);
  }

  const gsapOutBlocks = () => {
    if (!luksoAvatarRef.current || !exclusiveCollectionRef.current) return
    translationInOutBlock(luksoAvatarRef.current, DURATION_ANIMATION_SECTION, true);
    translationInOutBlock(exclusiveCollectionRef.current, DURATION_ANIMATION_SECTION, true, true, () => {
      if (!hasMinted)
        setCurrentSection(LuksoSections.Mint);
      else
        setCurrentSection(LuksoSections.Edit);
    });
  }
  useEffect(() => {
    if (!wallet) return
    const canUserMintPromise = () => {
      const canUserMint = canMint()
      setCanUserMint(canUserMint)
    }
    void canUserMintPromise()
  }, [wallet])
  useLayoutEffect(() => {
    void gsapEnterBlocks();
  }, [])

  return (
    <>
      {true && <LoginUI />}
      {false && <section className={`flex h-full items-center justify-between`}>
        <div className={`fixed h-screen w-full flex justify-center items-center bg-[#FFCBDE] top-14 duration-100 transition-all ${isGettingInfoAboutHasMinted ? 'flex' : 'hidden'}`}>
          <div className="scale-[3]">
            <Loader />
          </div>
        </div>
        {/* Lukso Avatars */}
        <div ref={luksoAvatarRef} className="max-w-[40%] w-[580px] 2xl:w-[688px] -translate-x-full h-[70%] flex flex-col gap-3">
          <TransparentBox
            fullWidth
            border
            backgroundColorClass="bg-[#FFCBDE]"
            heightClass="grow"
            paddingClass="pb-3 px-10"
          >
            <div className="relative w-full h-1/2 pointer-events-none overflow-hidden rounded-lg">
              <Image
                src={picture}
                fill
                alt="lukso avatar full body view"
                className="origin-top bottom-0 scale-95"
                style={{ objectFit: "cover" }}
              />
            </div>
            <h2 className="font-extrabold text-2xl 2xl:text-4xl pt-5">LUKSO CITIZENS</h2>
            <p className="text-center text-sm 2xl:text-base pt-2">The scientists at THE HUB developed a digital genome for all the participants of the creator economy. With this identity, luksonians will be able to travel between worlds, games and experiences and impress the world with their creative powers.</p>
          </TransparentBox>

          {(provider) && (
            <>
              {!isGettingInfoAboutHasMinted ? (
                <button className="w-full h-fit disabled:opacity-75" onClick={() => void gsapOutBlocks()} disabled={!canUserMint} >
                  <TransparentBox
                    fullWidth
                    border
                    backgroundColorClass="bg-white"
                    heightClass="h-[70px] 2xl:h-[85px]"
                    aditionalClass="flex-row"
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-black text-lg 2xl:text-xl">{canUserMint === false && 'Mint is not available for this address' || !hasMinted && "Claim or Roll your Citizen" || "Edit your Citizen"} </p>
                      <FaDice className="text-black text-2xl" />
                    </div>
                  </TransparentBox>
                </button>
              ) : (
                <div className="w-full h-fit cursor-wait">
                  <TransparentBox
                    fullWidth
                    border
                    backgroundColorClass="bg-white"
                    heightClass="h-[70px] 2xl:h-[85px]"
                    aditionalClass="flex-row"
                  >
                    <div className="flex items-center gap-3 text-black text-lg 2xl:text-xl">
                      <p>Obtaining wallet information</p>
                      <AiOutlineLoading className="animate-spin" />
                    </div>
                  </TransparentBox>
                </div>
              )}
            </>
          )
          }
          {!provider && <button className="w-full h-fit" onClick={() => setIsConnecting(true)}  >
            <TransparentBox
              fullWidth
              border
              backgroundColorClass="bg-white"
              heightClass="h-[70px] 2xl:h-[85px]"
              aditionalClass="flex-row"
            >
              <div className="flex items-center gap-3">
                <p className="text-black text-lg 2xl:text-xl">Login</p>
                <FaWallet className="text-black text-2xl" />
              </div>
            </TransparentBox>
          </button>}
        </div>

        {
          isConnecting && <ConnectModalUI

            setIsConnecting={(value) => setIsConnecting(value)}
          />
        }

        {/* Exclusive collection */}
        <div ref={exclusiveCollectionRef} className="max-w-[45%] flex flex-row h-[70%] gap-3 translate-x-full">
          <div className="max-w-[45%] w-[280px] 2xl:w-[345px] h-full flex flex-col">
            <TransparentBox
              fullWidth
              border
              borderSizeClass="border-b-0"
              backgroundColorClass="bg-[#FFCBDE]"
              heightClass="h-[125px]"
            >
              <h3 className="font-extrabold text-xl 2xl:text-2xl">EXCLUSIVE COLLECTION</h3>
              <p className="text-sm 2xl:text-base">Remaining: {AVATAR_MAX_SUPPLY - avatarSupply}</p>
            </TransparentBox>
            <TransparentBox
              fullWidth
              border
              borderSizeClass="border-b-0"
              backgroundColorClass="bg-[#FFCBDE]"
              heightClass="grow"
            >
              <h3 className="font-semibold text-xl 2xl:text-2xl">Rarity</h3>
              <div className="mt-5 text-base 2xl:text-lg font-semibold">
                <p className="text-gray-400">Common</p>
                <p className="text-sky-400">Rare</p>
                <p className="text-violet-400">Epic</p>
                <p className="text-pink-400">Mythical</p>
              </div>
            </TransparentBox>
            <TransparentBox
              fullWidth
              border
              backgroundColorClass="bg-[#FFCBDE]"
              heightClass="grow"
            >
              <h3 className="font-semibold text-xl 2xl:text-2xl">Deluxe Avatars</h3>
              <div className="mt-5 text-base 2xl:text-lg font-semibold">
                <p className="text-yellow-500">Golden</p>
                <p className="text-gray-400">Silver</p>
                <p className="text-yellow-700">Bronce</p>
              </div>
            </TransparentBox>
          </div>

          <div className="w-fit lg:w-[280px] 2xl:w-[345px] flex">
            <TransparentBox
              fullWidth
              border
              backgroundColorClass="bg-[#FFCBDE]"
              heightClass="grow"
              paddingClass="px-0"
              justifyClass="justify-start"
            >
              <div className="relative w-full h-1/2 overflow-hidden border-b-2 border-white flex justify-end
            flex-col bg-[#d59fba]">
                <Image
                  src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${process.env.NEXT_PUBLIC_IPFS_IMAGE_URL}/${combination}.png${'?pinataGatewayToken=' + process.env.NEXT_PUBLIC_IPFS_GATEWAY_API_KEY}`}
                  alt="lukso avatar selfie view"
                  fill
                  /*                 style={{ objectFit: "cover" }} */
                  /*                 className="origin-top scale-[300%] -translate-y-1/4" */

                  onLoadStart={() => {
                    setIsLoading(true)
                  }}
                  onLoad={() => {
                    setIsLoading(false)
                  }}
                  hidden={isLoading}
                />
              </div>
              <p className="grow flex items-center text-sm 2xl:text-base mx-10 2xl:mx-14">
                LUKSO Citizens is a collection of {AVATAR_MAX_SUPPLY} interoperable Avatars on the LUKSO Blockchain.
              </p>
            </TransparentBox>
          </div>
        </div>
      </section >}
    </>
  )
}
