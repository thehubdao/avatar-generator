import Image from "next/image";
import { FeatureBasic } from "../../../interfaces/common.interface";

interface FeatureItemSelectorUIProps {
  item: FeatureBasic;
  activeOpc?: string;
  handleClick: (name: string) => void;
}

export default function FeatureItemSelectorUI({ item, activeOpc, handleClick }: FeatureItemSelectorUIProps) {
  const isActive: boolean = activeOpc && activeOpc === item.displayName ? true : false;
  const selectFeature = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    handleClick(name);
  }

  return (
    <div
      onClick={event => {
        selectFeature(event, item.displayName)
      }}
    >
      <div className={`w-[84px] h-[84px] flex justify-center items-center rounded-xl cursor-pointer ${isActive ? 'bg-accent bg-opacity-80 shadow-inset-hard' : 'bg-bg shadow-flat-soft hover:shadow-flat-hard'} transition-all duration-500`} title={item.displayName}>
        <Image alt={item.displayName} width={70} height={70} src={'/resources/icons/features/Chest.svg'} priority />
      </div>
    </div>
  )
}