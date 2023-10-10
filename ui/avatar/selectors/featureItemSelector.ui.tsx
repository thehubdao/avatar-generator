import { FeaturesIcons } from "../../../enums/icons.enum";
import { FeatureBasic } from "../../../interfaces/common.interface";
import { MouseEvent } from "react";

interface FeatureItemSelectorUIProps {
  item: FeatureBasic;
  activeOpc?: string;
  handleClick: (name: string) => void;
}

export default function FeatureItemSelectorUI({ item, activeOpc, handleClick }: FeatureItemSelectorUIProps) {
  const isActive: boolean = activeOpc && activeOpc === item.displayName ? true : false;
  const selectFeature = (e: MouseEvent<HTMLDivElement>, name: string) => {
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
        <p className="font-featuresIcons text-6xl text-gray-extralight">{item.iconUrl && item.iconUrl.length > 0 ? item.iconUrl : FeaturesIcons.Shirt}</p>
      </div>
    </div>
  )
}