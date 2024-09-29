import Image from "next/image";

interface CampaignCardProps {
  title: string;
  imgSrc: string;
  imgAlt: string;
}

export default function CampaignCard({ title, imgSrc, imgAlt }: CampaignCardProps) {
  return (
    <div className="w-[280px] h-[388px] rounded-2xl overflow-hidden cursor-pointer">
      <div className="relative w-full h-[300px]">
        <Image src={imgSrc} alt={imgAlt} fill className="object-cover" />
      </div>
      <div className="bg-citizens-dark h-[88px] flex justify-center items-center">
        <p className="text-center text-white text-xl truncate px-4">{title}</p>
      </div>
    </div>
  )
}


