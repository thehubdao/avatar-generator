import Image from "next/image";
import { useEffect } from "react";
import { FeatureInterface } from "../../../interfaces/api.interface";
import { BasicData } from "../../../interfaces/common.interface";

interface FeatureSelectorProps {
  list?: FeatureInterface[] | BasicData[];
  activeOpc?: string;
  handleClick: (id: string) => void;
}

interface OptionSelectorProps {
  item: FeatureInterface | BasicData,
  isActive: boolean
}

function OptionSelector({ item, isActive }: OptionSelectorProps) {
  return (
    <div className={`w-[100px] h-[100px] flex justify-center items-center bg-bg rounded-xl cursor-pointer ${isActive ? 'bg-accent shadow-inset-hard' : 'shadow-flat-hard'}`} title={item.id}>
      <Image alt={item.id} width={70} height={70} src={'/resources/icons/features/Chest.svg'} priority />
    </div>
  )
}

export default function FeatureSelector({ list, activeOpc, handleClick }: FeatureSelectorProps) {

  const selectFeature = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    handleClick(id);
  }

  return (
    <div>
      {
        list ?
          list.map(opt => {
            return (
              <div key={opt.id} className="py-3 px-4">
                <div onClick={event => selectFeature(event, opt.id)}>
                  <OptionSelector item={opt} isActive={activeOpc && activeOpc === opt.id ? true : false} />
                </div>
              </div>
            )
          })
          :
          <p>no features</p>
      }
    </div>
  )
}