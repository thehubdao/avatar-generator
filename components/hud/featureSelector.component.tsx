import Image from "next/image";
import { FeatureInterface } from "../../interfaces/api.interface";
import { BasicData } from "../../interfaces/common.interface";
import { useEffect } from "react";

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
    <div className={`w-[100px] h-[100px] flex justify-center items-center bg-bg rounded-xl shadow-flat-hard cursor-pointer ${isActive ? 'bg-accent shadow-inset-hard' : ''}`} title={item.id}>
      <Image alt={item.id} width={70} height={70} src={'/resources/icons/features/Chest.svg'} />
    </div>
  )
}

export default function FeatureSelector({ list, activeOpc, handleClick }: FeatureSelectorProps) {

  const selectFeature = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    handleClick(id);
  }

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("list: ", list)
  }, [list]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("Active Feature: ", activeOpc)
  }, [activeOpc]);

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