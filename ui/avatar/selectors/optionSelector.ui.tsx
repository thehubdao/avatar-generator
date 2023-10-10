import { FeatureInterface } from "../../../interfaces/api.interface";
import { BasicData } from "../../../interfaces/common.interface";
import OptionCardUI from "./optionCard.ui";
import {MouseEvent} from "react";

interface OptionSelectorProps {
  list?: FeatureInterface[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

export default function OptionSelectorUI({ list, activeOption, handleClick }: OptionSelectorProps) {

  const selectFeature = (e: MouseEvent<HTMLDivElement>, opt: FeatureInterface) => {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }

  return (
    <div className="flex flex-wrap flex-col gap-3 content-start overflow-x-auto h-[190px] min-[1440px]:h-[390px]">
      {list ?
        list.map(opt => {
          return (
            <div key={opt.id} onClick={event => selectFeature(event, opt)}>
              <OptionCardUI option={opt} isActive={activeOption && activeOption.val === opt.name} />
            </div>
          )
        })
        :
        <p>no options</p>}
    </div>
  )
}