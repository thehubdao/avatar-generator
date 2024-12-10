import Image from "next/image";
import { CardSize } from "../../../enums/citizens/common.enum";
import { Game } from "../../../interfaces/citizens.interface";
import CampaignCard from "../common/campaignCard.ui";
import Modal from "../common/modal.ui";
import { useState } from "react";
import Button from "../common/button.ui";
import Link from "next/link";

const GAMES: Game[] = [
  {
    name: 'NIFTY ISLAND',
    link: 'https://www.niftyisland.com/',
    bgSrc: '/resources/images/play/nifty.png',
    iconSrc: '/resources/images/play/logos/nifty.png',
    instructions: [
      'Log into your Nifty Island account',
      'Go to your profile, click on “create”',
      'Click on the upload icon in assets to upload your downloaded Citizen.',
      'Upload a cover image for your avatar and click on "Start Build"',
      'Click "Next"',
      'Click the "Creator Agreement" and click "Create"'
    ],
    guide: 'https://youtu.be/grE_znFG3-4?feature=shared'
  },
  {
    name: 'HYPERFY',
    link: 'https://hyperfy.io/',
    bgSrc: '/resources/images/play/hyperfy.png',
    iconSrc: '/resources/images/play/logos/hyperfy.png',
    instructions: [
      'Log in to hyperfy_io with your preferred wallet',
      'Choose your virtual world for interactions',
      'Click on the “Avatar” icon and select the "Upload" option',
      'Click “Equip” to import your Citizen',
      'Click on “Settings” and set your avatar to “Heavy+”'
    ]
  },
  {
    name: 'DVERSO',
    link: 'https://dverso.io/',
    bgSrc: '/resources/images/play/dverso.png',
    iconSrc: '/resources/images/play/logos/dverso.png',
    instructions: [
      'Log in to Dverso using your preferred wallet ',
      'Visit your profile ',
      'Go to "Settings"',
      'Click on "Wardrobe"',
      'Click on “Upload a VRM”',
      'Upload your downloaded Citizen ',
      'Once uploaded, select your Citizen from your avatar list, and it’s ready to use!'
    ]
  },
  {
    name: 'ONCYBER',
    link: 'https://oncyber.io/',
    bgSrc: '/resources/images/play/oncyber.png',
    iconSrc: '/resources/images/play/logos/oncyber.png',
    instructions: [
      'Click on the pen (customize button), next to the profile picture',
      'Click on "Uploaded"',
      'Click on the "+" to upload your VRM',
      'Click on "create" to develop your own worlds'
    ]
  }
]

export default function Play() {

  const [isOpenInstructions, setIsOpenInstructions] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game>();

  function openExternal(game: Game) {
    setIsOpenInstructions(true);
    setSelectedGame(game);

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
        <Modal modalStyles="!min-h-fit !w-[60vw]" handleClose={() => { setIsOpenInstructions(false) }}>
          <div className="grid justify-center">
            <div className="grow text-white grid gap-4">
              <p className="font-semibold text-center text-2xl">How to upload your Citizen on {selectedGame.name}</p>
              {
                selectedGame.instructions.map((instruction, index) => (
                  <p key={index} className="text-lg">· {instruction}</p>
                ))
              }
              {selectedGame.guide &&
                <p className="text-center pt-5">You can watch the video guide <Link className="underline" href={selectedGame.guide} target="_blank">here</Link></p>
              }
            </div>
            <div className="grid gap-4 pt-20">
              <Button label={'Go to ' + selectedGame.name } textStiles="w-full text-center" light handleClick={() => {
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