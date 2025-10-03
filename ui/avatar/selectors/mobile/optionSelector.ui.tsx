import 'swiper/css';
import { BasicData } from '../../../../interfaces/common.interface';
import { MouseEvent } from "react";
import OptionCardUI from "../optionCard.ui";
import { RandomTier } from "../../../../enums/common.enum";
import { AnyFeature } from "../../../../types/citizens.type";

interface OptionSelectorUIProps {
  list: AnyFeature[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

export default function OptionSelectorUI({ list, activeOption, handleClick }: OptionSelectorUIProps) {
  const selectFeature = (e: MouseEvent<HTMLDivElement>, opt: AnyFeature) => {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }
  return <>
    <div className='w-full px-2 flex flex-wrap overflow-y-scroll gap-2 justify-center h-fit items-center'>
      {list.length > 0 ?
        list.map((opt, index) => (
          <div key={opt.id + index} onClick={event => selectFeature(event, opt)}>
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
        } as AnyFeature} />
      }
    </div>
  </>
}