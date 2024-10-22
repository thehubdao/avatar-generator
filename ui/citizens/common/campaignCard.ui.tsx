import Image from "next/image";
import { CardSize } from "../../../enums/citizens/common.enum";

interface CampaignCardProps {
  title: string;
  tokenID?: string;
  imgSrc: string;
  imgAlt: string;
  light?: boolean;
  size?: CardSize;
  overlayText?: string;
  selected?: boolean;
  handleClick?: () => void;
}

export default function CampaignCard({ title, tokenID, imgSrc, imgAlt, light = false, size = CardSize.Medium, overlayText, selected = false, handleClick }: CampaignCardProps) {

  function onCardClicked() {
    if(handleClick) handleClick();
  }

  return (
    <div className={`group relative ${size === CardSize.Small ? 'w-[228px] h-[272px]' : size === CardSize.Medium ? 'w-[280px] h-[388px]':'w-[275px] h-[568px]'} rounded-2xl overflow-hidden cursor-pointer ${selected ? 'border-4 border-white' : ''}`} onClick={() => onCardClicked()}>
      <div className={`relative w-full ${size === CardSize.Small ? 'h-[228px]' : size === CardSize.Medium ? 'h-[300px]':'h-[515px]'}`}>
        <Image src={imgSrc} alt={imgAlt} fill className="object-cover" />
        {overlayText && !selected &&
          <div onClick={handleClick} className="absolute w-full h-full flex justify-center items-center bg-citizens-dark/75 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="font-light text-lg text-white">{overlayText}</p>
          </div>
        }
      </div>
      {tokenID &&
        <div className={`absolute inset-3 w-fit h-fit bg-citizens-bluedark rounded-full px-2 ${!selected ? 'group-hover:bg-citizens-gray' : ''} transition-colors`}>
          <p className={`text-xs text-white ${!selected ? 'group-hover:text-citizens-bluedark' : ''} p-1`}>#{tokenID}</p>
        </div>
      }
      <div className={`relative ${light ? 'bg-white/75' : 'bg-citizens-dark'} ${size === CardSize.Small ? 'h-[44px]' : size === CardSize.Medium ? 'h-[88px]':'h-[53px]'} flex justify-center items-center`}>
        <p className={`${light ? 'text-citizens-dark' : 'text-white'} text-center ${size === CardSize.Small ? 'text-sm' : size === CardSize.Medium ? 'text-xl':'text-xl'} truncate px-4 ${selected ? 'pb-2' : ''}`}>{title}</p>
        {
        selected &&
        <div className="absolute bottom-full w-full bg-white">
          <p className="text-xs text-black/50 text-center py-1">CURRENTLY USED</p>
        </div>
      }
      </div>
    </div>
  )
}


