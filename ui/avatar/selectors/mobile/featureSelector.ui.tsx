import { Swiper, SwiperSlide } from 'swiper/react';
import { MouseEvent } from "react";
import 'swiper/css';
import { FeatureBasic } from '../../../../interfaces/common.interface';

interface Props {
  list: FeatureBasic[];
  activeOpc: string;
  handleClick: (id: string) => void;
}

function OptionList({ list, activeOpc, handleClick }: Props) {

  function selectFeature(e: MouseEvent, id: string) {
    e.preventDefault();
    handleClick(id);
  }

  return list?.map((opt: FeatureBasic, index: number) => {
    return (
      <SwiperSlide className='flex flex-col items-center justify-center' key={index} onClick={(event: MouseEvent) => selectFeature(event, opt.displayName)}>
        <p className={'text-xs text-center p-2 opacity-50' + (activeOpc == opt.displayName ? ' opacity-90 text-slate-700 border-b-[1px] border-slate-700' : '')}>
          {opt.displayName.toUpperCase()}
        </p>
      </SwiperSlide>
    )
  });
}

export default function FeatureSelectorComponent(props: Props) {
  const itemsLength = props.list?.length ? props.list.length : 1;
  const itemsPerView = 4;
  return (
    <div className='w-full relative'>
      <Swiper
        slidesPerView={itemsPerView}
        centeredSlides={true}
        autoFocus
        grabCursor={true}
        loop={itemsLength < itemsPerView ? false : true} //! error with this prop on swipper lib (loop)
        // onSlideChange={() => console.log('slide change')}
        // onSwiper={(swiper) => console.log(swiper)}
        className='!pt-1'
      >
        {OptionList(props)}
      </Swiper>
      <div className='absolute w-full px-3' >
        <div className='w-full border-b-[1px] border-slate-300' />
      </div>
    </div>
  )
}