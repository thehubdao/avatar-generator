import { RandomTier } from "../../../enums/common.enum";
import { BasicData } from "../../../interfaces/common.interface";
import { AnyFeature } from "../../../types/citizens.type";
import LogoUI from "../../lukso/common/logo.ui";
import OptionCardUI from "./optionCard.ui";
import { MouseEvent } from "react";

interface OptionSelectorProps {
  list?: AnyFeature[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

export default function OptionSelectorUI({ list, activeOption, handleClick }: OptionSelectorProps) {

  const selectFeature = (e: MouseEvent<HTMLDivElement>, opt: AnyFeature) => {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }
  return (
    <div className="flex flex-wrap flex-col gap-3 content-start overflow-x-auto h-[190px] dark:h-[220px] min-[1440px]:h-[390px]">
      {list ?
        ( list.length > 0 ?
          list.map(opt => (
            <div key={opt.id} onClick={event => selectFeature(event, opt)}>
              <OptionCardUI option={opt} isActive={activeOption && activeOption.val === opt.name} />
            </div>
          ))
          :
          <OptionCardUI option={{
            id: 'empty',
            index: 0,
            name: 'No options',
            type: 'empty',
            tier: RandomTier.Common,
            path: '',
          } as AnyFeature}  />
        )
        : // Make void list validation and loading view
        <div className="w-1/6 translate-x-[200%] flex justify-center"> <LogoUI colorSecundary="rgba(25, 216, 243, 0.3)" /></div>
      }
    </div>
  )
}