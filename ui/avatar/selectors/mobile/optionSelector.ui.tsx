import { FeatureInterface } from "../../../../interfaces/api.interface";
import 'swiper/css';
import { BasicData } from '../../../../interfaces/common.interface';
import { OptionItemUI } from "./optionItem.ui";

interface OptionSelectorUIProps {
  list: FeatureInterface[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

export default function OptionSelectorUI({ list, activeOption, handleClick }: OptionSelectorUIProps) {
  return <>
    <div className='w-full px-2 flex flex-wrap overflow-y-scroll gap-2 justify-center h-fit items-center'>
      {list.map((opt, index) => (
        <OptionItemUI key={index} opt={opt} isActive={activeOption?.val === opt.name} handleClick={(id, path, name) => handleClick(id, path, name)} />
      ))}
    </div>
  </>
}