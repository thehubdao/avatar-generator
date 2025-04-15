import { useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import ConnectButton from "./connectButton.ui";
import LogoTheHub from "./SVG/logoTheHubSVG.ui";
import Image from "next/image";
import Button from "./button.ui";
import SocialButtons from "./socialButtons.ui";
import { CitizensPageLocation } from "../../../enums/citizens/common.enum";
import { GoToPage } from "../../../utils/router.util";

interface HeaderUIProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function HeaderUI({onLogin, onLogout}: HeaderUIProps) {
  const isLoggedIn = useAppSelector(state => state.citizensAuth.connected);

  const [isBurguerOpen, setIsBurguerOpen] = useState(false);

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    }
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  }

  const handleNavbarClick = (location?: CitizensPageLocation) => {
    setIsBurguerOpen(false);
    if (location) GoToPage(location);
  }
  return (
    <header className="fixed w-dvw z-50 inset-0 h-fit flex justify-between items-center pt-8 px-6">
      {/* LOGO THE HUB */}
      <div className="w-fit h-fit" >
        <LogoTheHub />
      </div>
      {/* NAVBAR */}
      {isLoggedIn &&
        <>
          <div className={`fixed z-50 xl:relative inset-6 xl:inset-0 bg-citizens-dark xl:bg-inherit h-fit ${isBurguerOpen ? 'block' : 'hidden xl:block'}`}>
            <div className='w-full px-4 pt-4 pb-24 flex justify-between xl:hidden'>
              <Image
                src='/resources/images/the-hub-logo-white.svg'
                alt="the hub icon"
                width={182}
                height={32}
              />
              <div className={`w-10 h-[27px] border border-white rounded-full flex justify-center items-center`} onClick={() => setIsBurguerOpen(false)}>
                <div className='w-1/3 h-px bg-white'></div>
              </div>
            </div>
            <div className='xl:flex gap-4 pb-8 xl:pb-0 px-4'>
              <Button label="homebase" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                handleNavbarClick(CitizensPageLocation.HOME);
              }} />
              <Button label="Wardrobe" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                handleNavbarClick();
              }}>
                {/* {isSavingCombination ?
                  <div className="w-3 h-3 rounded-full border-t-[1px] border-white animate-spin" />
                  :
                  <ArrowLinkSVG />
                } */}
              </Button>
              <Button label="Backpack" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                handleNavbarClick(CitizensPageLocation.BACKPACK);
              }} />
              <Button label="leaderboard" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                handleNavbarClick();
              }} />
              <Button label="play" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                handleNavbarClick(CitizensPageLocation.PLAY);
              }} />
            </div>
            <div className='border-t-[1px] mx-4 xl:hidden'>
              <p className='text-center text-xs text-white font-light pt-8'>Follow us</p>
              <SocialButtons className='flex gap-4 w-full justify-center pt-4 pb-8' />
            </div>
          </div>
          <div className='grid w-[18px] gap-[6px] xl:hidden order-3' onClick={() => setIsBurguerOpen(true)}>
            <div className='w-full h-[2px] bg-white'></div>
            <div className='w-full h-[2px] bg-white'></div>
            <div className='w-full h-[2px] bg-white'></div>
          </div>
        </>
      }
      {/* CONNECT BUTTON */}
      <div className="flex gap-4">
        <ConnectButton onLogin={() => handleLogin()} onLogout={() => handleLogout()} />
      </div>
    </header>
  )
}