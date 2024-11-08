import { useState, useEffect } from "react";
import { GetUserXPAndLevel } from "../../../utils/firebase.util";
import ArrowSVG from "./SVG/arrowSVG.ui";
import Image from "next/image";
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
import StarSVG from "./SVG/starSVG.ui";
import { useFollowCount } from "../../../hooks/useFollowCount";
import { FormatWalletAddress } from "../../../utils/common.util";
import { useUniversalProfile } from '../../../hooks/useUniversalProfile';
import { usePrivy } from '@privy-io/react-auth';

interface ConnectButtonProps {
  isSigned?: boolean;
  setIsSigned: (signed: boolean) => void;
  address: string | undefined;
}

export default function ConnectButton({ isSigned = false, setIsSigned, address }: ConnectButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { followerCount, followingCount } = useFollowCount(address);
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(0);
  const { name, profileImage } = useUniversalProfile(address);
  const {authenticated:isAuthenthicated, user, ready:isReady } = usePrivy();

  useEffect(() => {
    if (address) {
      GetUserXPAndLevel(address).then(({ xp, level, nextLevelXP }) => {
        setUserXP(xp);
        setUserLevel(level);
        setNextLevelXP(nextLevelXP);
      });
    }
  }, [address]);

  useEffect(() => {
    if (isAuthenthicated && user) {
      setIsSigned(true);
    }
  }, [isAuthenthicated, user, setIsSigned]);

  return (
    <div className="relative w-fit 2xl:w-[376px] h-11 bg-white rounded-[20px] flex justify-center items-center">
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
            <div className="absolute top-full right-0 w-[376px] grid grid-cols-[144px_1fr] bg-white mt-3 rounded-[20px] overflow-hidden">
              <div className="relative h-full w-36">
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
                  <p className="grow text-xs pr-2">
                    lvl {userLevel}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center max-w-[240px] px-5">
                <p className="w-full font-light text-center text-2xl pt-4 pb-1 truncate">
                  {name || (address ? FormatWalletAddress(address, 6) : 'No name')}
                </p>
                <div className="w-full flex justify-between">
                  <div className="font-medium text-xs text-center bg-citizens-gray rounded-md flex flex-col justify-center items-center py-2 px-4">
                    <p>{followerCount}</p>
                    <p>Followers</p>
                  </div>
                  <div className="font-medium text-xs text-center bg-citizens-gray rounded-md flex flex-col justify-center items-center py-2 px-4">
                    <p>{followingCount}</p>
                    <p>Following</p>
                  </div>
                </div>
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
          )}
        </>
      ) : (
        <ConnectWeb3Button 
          classStyles="w-full h-full" 
          setIsSigned={setIsSigned}
        >
          <div className="w-full h-full font-light text-lg px-4">
            {!isReady ? "Loading..." : 
             isAuthenthicated ? "Connected" : 
             "Log in"}
          </div>
        </ConnectWeb3Button>
      )}
    </div>
  );
}
