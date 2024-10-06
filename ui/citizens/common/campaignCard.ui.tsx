import Image from "next/image";

interface CampaignCardProps {
  title: string;
  tokenID?: string;
  imgSrc: string;
  imgAlt: string;
  light?: boolean;
  small?: boolean;
  overlayText?: string;
  selected?: boolean;
  onClick: () => void;
}

export default function CampaignCard({ title, tokenID, imgSrc, imgAlt, light = false, small = false, overlayText, selected = false, onClick }: CampaignCardProps) {
  return (
    <div className={`group relative ${small ? 'w-[228px] h-[272px]' : 'w-[280px] h-[388px]'} rounded-2xl overflow-hidden cursor-pointer ${selected ? 'border-4 border-white' : ''}`}>
      <div className={`relative w-full ${small ? 'h-[228px]' : 'h-[300px]'}`}>
        <Image src={imgSrc} alt={imgAlt} fill className="object-cover" />
        {overlayText && !selected &&
          <div onClick={onClick} className="absolute w-full h-full flex justify-center items-center bg-citizens-dark/75 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="font-light text-lg text-white">{overlayText}</p>
          </div>
        }
      </div>
      {tokenID &&
        <div className={`absolute inset-3 w-fit h-fit bg-citizens-bluedark rounded-full px-2 ${!selected ? 'group-hover:bg-citizens-gray' : ''} transition-colors`}>
          <p className={`text-xs text-white ${!selected ? 'group-hover:text-citizens-bluedark' : ''} p-1`}>#{tokenID}</p>
        </div>
      }
      <div className={`relative ${light ? 'bg-white/75' : 'bg-citizens-dark'} ${small ? 'h-[44px]' : 'h-[88px]'} flex justify-center items-center`}>
        <p className={`${light ? 'text-citizens-dark' : 'text-white'} text-center ${small ? 'text-sm' : 'text-xl'} truncate px-4 ${selected ? 'pb-2' : ''}`}>{title}</p>
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


