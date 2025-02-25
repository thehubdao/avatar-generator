import { useState, useRef } from "react";
import ArrowSVG from "./SVG/arrowSVG.ui";
import Image from "next/image";
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
import StarSVG from "./SVG/starSVG.ui";
import { useFollowCount } from "../../../hooks/useFollowCount";
import { FormatWalletAddress } from "../../../utils/common.util";
import { useUniversalProfile } from '../../../hooks/useUniversalProfile';
import { usePrivy } from '@privy-io/react-auth';
import { useXPVerification } from '../../../hooks/useXPVerification';
import LogoutSVG from "./SVG/logoutSVG.ui";
import { useOnClickOutside } from "usehooks-ts";
import { useBlockchainWallet } from "../../../hooks/useBlockchainWallet";

interface ConnectButtonProps {
  isSigned?: boolean;
  address?: string;
  onLogout?: () => void;
}

export default function ConnectButton({ isSigned, address, onLogout }: ConnectButtonProps) {
  const parentDOM = useRef(null);
  const { isSolana } = useBlockchainWallet();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { followerCount, followingCount } = useFollowCount(address);
  const { xpData } = useXPVerification();
  const { authenticated: isAuthenticated, ready: isReady, login } = usePrivy();

  const userXP = xpData?.xp ?? 0;
  const userLevel = xpData?.level ?? 0;
  const nextLevelXP = xpData?.nextLevelXP ?? 0;

  const { name, profileImage } = useUniversalProfile(address);

  useOnClickOutside(parentDOM, () => setIsOpen(false));

  return (
    <div ref={parentDOM} className="relative w-fit 2xl:w-[376px] h-11 bg-white rounded-[20px] flex justify-center items-center">
      {isSigned ? (
        <>
          <button className="w-full flex justify-between items-center p-1" onClick={() => setIsOpen(!isOpen)}>
            <div>
              {profileImage ? (
                <div className="w-9 h-9 rounded-full overflow-hidden">
                  <Image
                    src={profileImage}
                    width={36}
                    height={36}
                    alt="Profile"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 bg-gray-300 rounded-full" />
              )}
            </div>
            <div className="truncate">
              <p className="font-light text-lg px-4 truncate">
                {name || (address ? FormatWalletAddress(address, 6) : 'No name')}
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
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={'https://lipsum.app/random/280x300/'}
                      alt="Default"
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex justify-between items-center gap-2 bg-white p-1 rounded-full">
                    <div className="w-4 h-4 bg-black rounded-full flex justify-center items-center">
                      <StarSVG />
                    </div>
                    <p className="grow text-xs pr-2 whitespace-nowrap">
                      lvl {userLevel}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center max-w-[240px] px-5">
                  <p className="w-full font-light text-center text-2xl pt-4 pb-1 truncate">
                    {name || (address ? FormatWalletAddress(address, 6) : 'No name')}
                  </p>
                  {!isSolana && <div className="w-full flex justify-between">
                    <div className="font-medium text-xs text-center bg-citizens-gray rounded-md flex flex-col justify-center items-center py-2 px-3 sm:px-4">
                      <p>{followerCount}</p>
                      <p>Followers</p>
                    </div>
                    <div className="font-medium text-xs text-center bg-citizens-gray rounded-md flex flex-col justify-center items-center py-2 px-3 sm:px-4">
                      <p>{followingCount}</p>
                      <p>Following</p>
                    </div>
                  </div>}
                  <div className="w-full pb-3">
                    <p className="text-center py-1 opacity-50">XP: {userXP}/{nextLevelXP}</p>
                    <div className="h-1 w-full bg-citizens-gray rounded-full overflow-hidden">
                      <div
                        className="h-full bg-citizens-blue"
                        style={{ width: `${(userXP / nextLevelXP) * 100}%` }}
                      />
                    </div>
                    <p className="text-center text-xs mt-1 opacity-50">
                      {nextLevelXP - userXP} XP to level {userLevel + 1}
                    </p>
                  </div>
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
        <ConnectWeb3Button
          classStyles="w-full h-full"
          onClick={() => {
            login({ walletChainType: 'ethereum-and-solana' })
          }}
        >
          <div className="w-full h-full font-light text-lg px-4">
            {!isReady ? "Loading..." :
              isAuthenticated ? "Connected" :
                "Log in"}
          </div>
        </ConnectWeb3Button>
      )}
    </div>
  );
}
