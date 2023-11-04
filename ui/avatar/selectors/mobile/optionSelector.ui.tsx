import { Swiper, SwiperSlide } from 'swiper/react';
import { FeatureInterface } from "../../../../interfaces/api.interface";
import 'swiper/css';
import { BasicData } from '../../../../interfaces/common.interface';
import { MouseEvent } from 'react';
import GetImage from '../../../../components/commons/getImage.component';

interface Props {
  list?: FeatureInterface[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

function OptionList({ list, activeOption, handleClick }: Props) {
  function selectFeature(e: MouseEvent, opt: FeatureInterface) {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }

  return list != undefined ?
    list.map((opt: FeatureInterface, index: number) => {
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

export default function OptionSelectorComponent(props: Props) {
  return (
    <div className='w-full px-2 flex flex-wrap overflow-y-scroll gap-2 justify-center h-fit items-center'>
      {OptionList(props)}
    </div>
  )
}

