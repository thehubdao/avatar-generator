import Image from "next/image";
import { CardSize } from "../../../enums/citizens/common.enum";
import BlockSVG from "./SVG/blockSVG.ui";

interface CampaignCardProps {
  title: string;
  tokenID?: string;
  price?: string;
  blocked?: boolean;
  imgSrc: string;
  imgAlt: string;
  light?: boolean;
  size?: CardSize;
  overlayText?: string;
  selected?: boolean;
  chipColor?: string;
  handleClick?: () => void;
}

export default function CampaignCard({ title, tokenID, imgSrc, imgAlt, light = false, size = CardSize.Medium, overlayText, selected = false, price, blocked, chipColor, handleClick }: CampaignCardProps) {

  function onCardClicked() {
    if (handleClick) handleClick();
  }

  return (
    <div className={`group relative ${size === CardSize.Small ? 'w-[228px] h-[272px]' : size === CardSize.Medium ? 'w-[280px] h-[388px]' : size === CardSize.Large ? 'w-[275px] h-[568px]':'w-[488px] h-[573px]'} rounded-2xl overflow-hidden ${blocked ? 'cursor-not-allowed':'cursor-pointer'} ${selected ? 'border-4 border-white' : ''}`} onClick={() => onCardClicked()}>
      <div className={`relative w-full ${size === CardSize.Small ? 'h-[228px]' : size === CardSize.Medium ? 'h-[300px]' : 'h-[515px]'}`}>
        <Image src={imgSrc} alt={imgAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
        {overlayText && !selected &&
          <div onClick={handleClick} className="absolute w-full h-full flex justify-center items-center bg-citizens-dark/75 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="font-light text-lg text-white">{overlayText}</p>
          </div>
        }
        {blocked &&
          <div className={`absolute bottom-3 right-3 w-[26px] h-[26px] flex justify-center items-center bg-citizens-blue rounded-full`}>
            <BlockSVG />
          </div>
        }
      </div>
      {tokenID &&
        <div className={`absolute inset-3 w-fit h-fit bg-citizens-bluedark rounded-full px-2 ${!selected ? 'group-hover:bg-citizens-gray' : ''} transition-colors`}>
          <p className={`text-xs text-white ${!selected ? 'group-hover:text-citizens-bluedark' : ''} p-1`}>{tokenID}</p>
        </div>
      }
      {price &&
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 w-fit h-fit ${chipColor} rounded-full px-2 transition-colors`}>
          <p className={`text-xs text-black p-1`}>{price}</p>
        </div>
      }
      <div className={`relative ${light ? 'bg-white/75' : 'bg-citizens-dark'} ${size === CardSize.Small ? 'h-[44px]' : size === CardSize.Medium ? 'h-[88px]' : 'h-[53px]'} flex justify-center items-center`}>
        <p className={`${light ? 'text-citizens-dark' : 'text-white'} text-center ${size === CardSize.Small ? 'text-sm' : size === CardSize.Medium ? 'text-xl' : 'text-xl'} truncate px-4 ${selected ? 'pb-2' : ''}`}>{title}</p>
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


