import { FeatureInterface } from "../../../../interfaces/api.interface";
import 'swiper/css';
import { BasicData } from '../../../../interfaces/common.interface';
import { AssetOptionListUI } from "./assetOptionList";

interface AssetSelectorUIProps {
  list?: FeatureInterface[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

export default function AssetSelectorUI({ list, activeOption, handleClick }: AssetSelectorUIProps) {
  return (
    <div className='w-full px-2 flex flex-wrap overflow-y-scroll gap-2 justify-center h-fit items-center'>
      {AssetOptionListUI({ list, activeOption, handleClick })}
    </div>
  )
}

