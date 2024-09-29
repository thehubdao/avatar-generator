import { useState } from "react";
import ArrowSVG from "./SVG/arrowSVG.ui";
import Image from "next/image";
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
import StarSVG from "./SVG/starSVG.ui";

interface ConnectButtonProps {
  isConnected?: boolean;
}

export default function ConnectButton({ isConnected = false }: ConnectButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="relative w-[376px] h-11 bg-white rounded-[20px] flex justify-center items-center">
      {
        isConnected ?
          <>
            <button className="w-full flex justify-between items-center p-1" onClick={() => setIsOpen(!isOpen)}>
              <div>
                <div className="w-9 h-9 bg-red rounded-full" />
              </div>
              <div>
                <p className="font-light text-lg">
                  Patabrava.eth
                </p>
              </div>
              <div className={`w-9 h-9 flex justify-center items-center ${isOpen ? 'rotate-180' : ''}`}>
                <ArrowSVG />
              </div>
            </button>
            {
              isOpen &&
              <div className="absolute top-full left-0 w-full grid grid-cols-[144px_1fr] bg-white mt-3 rounded-[20px] overflow-hidden">
                <div className="relative h-full w-36">
                  <Image src={'https://lipsum.app/random/280x300/'} alt="1" fill className="object-cover" />
                  <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex justify-between items-center gap-2 bg-white p-1 rounded-full">
                    <div className="w-4 h-4 bg-black rounded-full flex justify-center items-center">
                      <StarSVG />
                    </div>
                    <p className="grow text-xs pr-2">
                      lvl 23
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center max-w-[240px] px-5">
                  <p className="w-full font-light text-center text-2xl pt-4 pb-1 truncate">Patabrava.eth</p>
                  <div className="w-full flex justify-between">
                    <div className="font-medium text-xs text-center bg-citizens-gray rounded-md flex flex-col justify-center items-center py-2 px-4">
                      <p>2115</p>
                      <p>Followers</p>
                    </div>
                    <div className="font-medium text-xs text-center bg-citizens-gray rounded-md flex flex-col justify-center items-center py-2 px-4">
                      <p>450</p>
                      <p>Following</p>
                    </div>
                  </div>
                  <p className="text-center pt-1 opacity-50">Creator Points: 555</p>
                  <div className="w-full pb-3">
                    <p className="text-center py-1 opacity-50">XP: 1315/1824</p>
                    <div className="h-1 w-full bg-citizens-gray rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-citizens-blue" />
                    </div>
                  </div>
                </div>
              </div>
            }
          </>
          :
          <ConnectWeb3Button classStyles="w-full h-full" onConnect={() => { }} >
            <div className="w-full h-full font-light text-lg">
              Connect
            </div>
          </ConnectWeb3Button>

      }
    </div>
  )
}