import Image from "next/image";

interface CampaignCardProps {
  title: string;
  imgSrc: string;
  imgAlt: string;
  light?: boolean;
  small?: boolean;
}

export default function CampaignCard({ title, imgSrc, imgAlt, light = false, small = false }: CampaignCardProps) {
  return (
    <div className={`${small ? 'w-[228px] h-[272px]':'w-[280px] h-[388px]'} rounded-2xl overflow-hidden cursor-pointer`}>
      <div className={`relative w-full ${small ? 'h-[228px]':'h-[300px]'}`}>
        <Image src={imgSrc} alt={imgAlt} fill className="object-cover" />
      </div>
      <div className={`${light ? 'bg-white/75':'bg-citizens-dark'} ${small ? 'h-[44px]':'h-[88px]'} flex justify-center items-center`}>
        <p className={`${light ? 'text-citizens-dark':'text-white'} text-center ${small ? 'text-sm':'text-xl'} truncate px-4`}>{title}</p>
      </div>
    </div>
  )
}


