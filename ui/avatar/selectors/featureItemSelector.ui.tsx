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
      <div className={`w-[84px] h-[84px] flex justify-center items-center rounded-xl cursor-pointer ${isActive ? 'bg-accent dark:bg-citizens-dark bg-opacity-80 dark:bg-opacity-100 shadow-inset-hard dark:shadow-flat-soft-dark' : 'bg-bg dark:bg-citizens-dark shadow-flat-soft dark:shadow-flat-soft-dark hover:shadow-flat-hard hover:dark:shadow-flat-hard-dark'} transition-all duration-500`} title={item.displayName}>
        <p className={`text-gray-extralight ${isActive ? 'dark:text-white':'dark:text-white/20'} font-featuresIcons text-6xl transition-colors duration-500`}>{item.iconUrl && item.iconUrl.length > 0 ? item.iconUrl : FeaturesIcons.Shirt}</p>
      </div>
    </div>
  )
}