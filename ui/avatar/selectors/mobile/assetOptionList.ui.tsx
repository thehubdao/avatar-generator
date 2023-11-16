import GetImage from "../../../../components/commons/getImage.component";
import { FeatureInterface } from "../../../../interfaces/api.interface";
import { BasicData } from "../../../../interfaces/common.interface";
import { MouseEvent } from 'react';

interface AssetOptionListUIProps {
  list?: FeatureInterface[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

export function AssetOptionListUI({ list, activeOption, handleClick }: AssetOptionListUIProps) {
  function selectFeature(e: MouseEvent, opt: FeatureInterface) {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }

  return list != undefined ?
    list.map((opt, index) => {
      return (
        <div className='flex justify-center items-center' key={index}>
          <div className={`rounded-md w-28 h-28 flex items-center justify-center relative overflow-hidden`} onClick={event => selectFeature(event, opt)}>
            <GetImage url={opt.thumb} alt={opt.path} />
            <div className={'w-full h-full absolute top-0 left-0 bg-opacity-0 border-4 border-accent rounded-md opacity-0' + (activeOption?.val === opt.name ? '  opacity-100' : '')}></div>
          </div>
        </div>
      )
    }) : <></>;
}