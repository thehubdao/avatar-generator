import Image from "next/image";
import { CardSize } from "../../../enums/citizens/common.enum";
import { Game } from "../../../interfaces/citizens.interface";
import CampaignCard from "../common/campaignCard.ui";
import Modal from "../common/modal.ui";
import { useState } from "react";
import Button from "../common/button.ui";

const GAMES: Game[] = [
  {
    name: 'NIFTY ISLAND',
    link: 'https://www.niftyisland.com/',
    bgSrc: '/resources/images/play/nifty.png',
    iconSrc: '/resources/images/play/logos/nifty.png'
  },
  {
    name: 'HYPERFY',
    link: 'https://hyperfy.io/',
    bgSrc: '/resources/images/play/hyperfy.png',
    iconSrc: '/resources/images/play/logos/hyperfy.png'
  },
  {
    name: 'DVERSO',
    link: 'https://dverso.io/',
    bgSrc: '/resources/images/play/dverso.png',
    iconSrc: '/resources/images/play/logos/dverso.png'
  },
  {
    name: 'ONCYBER',
    link: 'https://oncyber.io/',
    bgSrc: '/resources/images/play/oncyber.png',
    iconSrc: '/resources/images/play/logos/oncyber.png'
  }
]

export default function Play() {

  const [isOpenInstructions, setIsOpenInstructions] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game>();

  function openExternal(game: Game) {
    setIsOpenInstructions(true);
    setSelectedGame(game);
    console.log(game);
    
    // window.open(link, "_blank");
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] py-32">
      {/* GAMES CARDS */}
      <div className="container mx-auto">
        <h1 className="font-monument text-white text-6xl text-center">AVAILABLE GAMES</h1>
        <div className="w-full pt-10 flex justify-center gap-8">
          {
            GAMES.map((world, index) => (
              <div key={index} className="group relative">
                <CampaignCard imgAlt={world.name} imgSrc={world.bgSrc} title={world.name} size={CardSize.Large} handleClick={() => {
                  openExternal(world)
                }} />
                <Image src={world.iconSrc} width={256} height={80} alt={world.name} className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 group-hover:scale-100 transition-transform duration-500" />
              </div>
            ))
          }
        </div>
      </div>
      {/* INSTRUCTION MODAL */}
      {isOpenInstructions && selectedGame &&
        <Modal modalStyles="!min-h-fit" handleClose={() => { setIsOpenInstructions(false) }}>
          <div className="grid justify-center">
            <div className="grow text-white grid gap-4">
              <p className="font-semibold text-center text-2xl">How to upload your Citizen on {selectedGame.name}</p>
              <p className="text-lg">Instructions</p>
            </div>
            <div className="grid gap-4 pt-8">
              <Button label="OK" textStiles="w-full text-center" light handleClick={() => {
                window.open(selectedGame.link, "_blank");
                setIsOpenInstructions(false);
              }} />
            </div>
          </div>
        </Modal>
      }
    </div>
  )
}