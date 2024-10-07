import Image from "next/image";
import ClockSVG from "./SVG/clockSVG.ui";
import PlusSVG from "./SVG/plusSVG.ui";

interface NotificationCardProps {
  title: string;
  points: number;
  time: string;
  image?: string;
  deleteSelf: () => void;
}

export default function NotificationCard({ title, points, time, image, deleteSelf }: NotificationCardProps) {
  return (
    <div className="flex justify-between items-center py-2 px-2 shadow-citizens-btn rounded-3xl bg-citizens-dark">
      {image && <div className="relative w-16 h-16 rounded-2xl overflow-hidden pr-6">
        <Image src={image} fill alt="" className="object-cover" />
      </div>}
      <div className="text-sm text-white grow pr-6 pl-1">
        <p>{title}</p>
        <p className="opacity-50">+{points} XP</p>
        <div className="flex items-center gap-2">
          <ClockSVG />
          <p className="opacity-50">{time} ago</p>
        </div>
      </div>
      <button className={`w-10 h-[27px] border border-white rounded-full flex justify-center items-center`} onClick={() => deleteSelf()}>
        <div className="rotate-45">
          <PlusSVG />
        </div>
      </button>
    </div>
  )
}