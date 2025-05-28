import { useState, useRef } from "react";
import ArrowSVG from "./SVG/arrowSVG.ui";
import Image from "next/image";
import StarSVG from "./SVG/starSVG.ui";
import { FormatWalletAddress } from "../../../utils/common.util";
import LogoutSVG from "./SVG/logoutSVG.ui";
import { useOnClickOutside } from "usehooks-ts";
import { Blockchain } from "../../../enums/blockchain/common.enum";
import { useAppSelector } from "../../../store/hooks";

interface ConnectButtonProps {
  onLogin: () => void;
  onLogout: () => void;
}

export default function ConnectButton({ onLogin, onLogout }: ConnectButtonProps) {
  const parentDOM = useRef(null);

  const isLoggedIn = useAppSelector(state => state.citizensAuth.connected);
  const blockchainType = useAppSelector(state => state.citizensAuth.blockchainType);
  const xpData = useAppSelector(state => state.citizensAuth.xpData);
  const followUserData = useAppSelector(state => state.citizensAuth.followUserData);

  const address = useAppSelector(state => state.citizensAuth.address);
  const walletName = useAppSelector(state => state.citizensAuth.walletName);
  const profileImage = useAppSelector(state => state.citizensAuth.profileImage);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useOnClickOutside(parentDOM, () => setIsOpen(false));

  return (
    <div ref={parentDOM} className="relative w-fit 2xl:w-[376px] h-11 bg-white rounded-[20px] flex justify-center items-center">
      {isLoggedIn ? (
        <>
          <button className="w-full flex justify-between items-center p-1" onClick={() => setIsOpen(!isOpen)}>
            <div className="relative w-9 h-9 rounded-full overflow-hidden">
              {profileImage ? (
                <Image
                  src={profileImage}
                  width={36}
                  height={36}
                  alt="Profile"
                  className="object-cover"
                />
              ) : (
                <Image
                  src={'https://lipsum.app/random/36x36/'}
                  alt="Profile"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="truncate">
              <p className="font-light text-lg px-4 truncate">
                {walletName ? walletName : address ? FormatWalletAddress(address, 6) : 'No address'}
              </p>
            </div>
            <div className={`w-9 h-9 flex justify-center items-center ${isOpen ? 'rotate-180' : ''}`}>
              <ArrowSVG />
            </div>
          </button>
          {isOpen && (
            <div className="absolute top-full xl:right-0 w-[320px] sm:w-[376px] mt-3">
              <div className="grid grid-cols-[112px_1fr] sm:grid-cols-[144px_1fr] bg-white rounded-[20px] overflow-hidden">
                <div className="relative h-full w-28 sm:w-36">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={'https://lipsum.app/random/280x300/'}
                      alt="Profile"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}
                  {xpData && <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex justify-between items-center gap-2 bg-white p-1 rounded-full">
                    <div className="w-4 h-4 bg-black rounded-full flex justify-center items-center">
                      <StarSVG />
                    </div>
                    <p className="grow text-xs pr-2 whitespace-nowrap">
                      lvl {xpData.level}
                    </p>
                  </div>}
                </div>
                <div className="flex flex-col items-center max-w-[240px] px-5">
                  <p className="w-full font-light text-center text-2xl pt-4 pb-1 truncate">
                    {address ? FormatWalletAddress(address, 6) : 'No address'}
                  </p>
                  {blockchainType !== Blockchain.Solana && <div className="w-full flex justify-between">
                    <div className="font-medium text-xs text-center bg-citizens-gray rounded-md flex flex-col justify-center items-center py-2 px-3 sm:px-4">
                      <p>{followUserData?.followerCount}</p>
                      <p>Followers</p>
                    </div>
                    <div className="font-medium text-xs text-center bg-citizens-gray rounded-md flex flex-col justify-center items-center py-2 px-3 sm:px-4">
                      <p>{followUserData?.followingCount}</p>
                      <p>Following</p>
                    </div>
                  </div>}
                  {xpData && <div className="w-full pb-3">
                    <p className="text-center py-1 opacity-50">XP: {xpData.xp}/{xpData.nextLevelXP}</p>
                    <div className="h-1 w-full bg-citizens-gray rounded-full overflow-hidden">
                      <div
                        className="h-full bg-citizens-blue"
                        style={{ width: `${(xpData.xp / xpData.nextLevelXP) * 100}%` }}
                      />
                    </div>
                    <p className="text-center text-xs mt-1 opacity-50">
                      {xpData.nextLevelXP - xpData.xp} XP to level {xpData.level + 1}
                    </p>
                  </div>}
                </div>
              </div>
              <div className="pt-3 w-full flex gap-3">
                <button className="w-full bg-white text-lg font-light px-4 py-2 rounded-2xl flex justify-center items-center gap-2"
                  onClick={() => {
                    if (onLogout) {
                      onLogout();
                    }
                  }}>
                  <LogoutSVG />
                  <p>Log out</p>
                </button>
                {/* <button className="w-full bg-white text-lg font-light px-4 py-2 rounded-2xl flex justify-center items-center gap-2">
                  <SwitchSVG />
                  <p>Switch profile</p>
                </button> */}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full font-light text-lg text-center px-4 cursor-pointer" onClick={() => onLogin()} >
          Log in
        </div>
      )}
    </div>
  );
}
