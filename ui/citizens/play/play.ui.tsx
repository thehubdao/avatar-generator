import Image from "next/image";
import { GAMES } from "../../../constants/citizens.constant";
import CampaignCard from "../common/campaignCard.ui";
import { useState } from "react";
import { Game } from "../../../interfaces/citizens.interface";
import Link from "next/link";
import Button from "../common/button.ui";
import Modal from "../common/modal.ui";
import { CardSize } from "../../../enums/citizens/common.enum";

export default function CitizensPlayUI() {
  const [isOpenInstructions, setIsOpenInstructions] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game>();

  function openExternal(game: Game) {
    setIsOpenInstructions(true);
    setSelectedGame(game);
  }

  return (
    <div className="relative w-full min-h-screen py-32">
      {/* GAMES CARDS */}
      <div className="container mx-auto">
        <h1 className="font-monument text-white text-4xl sm:text-6xl text-center px-6">AVAILABLE GAMES</h1>
        <div className="w-full pt-10 hidden xl:flex justify-center gap-8">
          {
            GAMES.map((world, index) => (
              <div key={index} className="group relative">
                <CampaignCard imgAlt={world.name} imgSrc={world.bgSrc} title={world.name} size={CardSize.Large} handleClick={() => openExternal(world)} />
                <Image src={world.iconSrc} width={256} height={80} alt={world.name} className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 group-hover:scale-100 transition-transform duration-500" />
              </div>
            ))
          }
        </div>
        <div className="w-full pt-10 px-6 grid gap-6 xl:hidden">
          {
            GAMES.map((world, index) => (
              <div key={index} className="relative w-full h-40 rounded-2xl overflow-hidden" onClick={() => openExternal(world)}>
                <Image src={world.bgSrc} fill alt={world.name} className="object-cover" />
                <Image src={world.iconSrc} width={256} height={80} alt={world.name} className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90" />
              </div>
            ))
          }
        </div>
      </div>
      {/* INSTRUCTION MODAL */}
      {isOpenInstructions && selectedGame &&
        <Modal modalStyles="max-h-[85vh] xl:max-h-auto xl:!min-h-fit w-[85vw] xl:!w-[60vw]" handleClose={() => { setIsOpenInstructions(false) }}>
          <div className="grid justify-center">
            <div className="grow text-white grid gap-4">
              <p className="font-semibold text-center text-base xl:text-2xl">How to upload your Citizen on {selectedGame.name}</p>
              {
                selectedGame.instructions.map((instruction, index) => (
                  <p key={index} className="text-sm xl:text-lg">· {instruction}</p>
                ))
              }
              {selectedGame.guide &&
                <p className="text-center pt-5 text-sm xl:text-base">You can watch the video guide <Link className="underline" href={selectedGame.guide} target="_blank">here</Link></p>
              }
            </div>
            <div className="grid gap-4 pt-8 xl:pt-20">
              <Button label={'Go to ' + selectedGame.name} textStyles="w-full text-center" light handleClick={() => {
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