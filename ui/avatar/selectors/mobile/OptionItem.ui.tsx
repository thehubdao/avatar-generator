import GetImage from "../../../../components/commons/getImage.component";
import { FeatureInterface } from "../../../../interfaces/api.interface";
import { MouseEvent } from 'react';

interface OptionItemUIProps {
  opt: FeatureInterface;
  activeOption: boolean;
  handleClick: (id: string, path: string, name: string) => void;
}

export function OptionItemUI({ opt, activeOption, handleClick }: OptionItemUIProps) {
  function selectFeature(e: MouseEvent, opt: FeatureInterface) {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }

  return (
    <div className='flex justify-center items-center'>
      <div className={`rounded-md w-28 h-28 flex items-center justify-center relative overflow-hidden`} onClick={event => selectFeature(event, opt)}>
        <GetImage url={opt.thumb} alt={opt.path} />
        <div className={'w-full h-full absolute top-0 left-0 bg-opacity-0 border-4 border-accent rounded-md opacity-0' + (activeOption ? '  opacity-100' : '')}></div>
      </div>
    </div>
  )
}