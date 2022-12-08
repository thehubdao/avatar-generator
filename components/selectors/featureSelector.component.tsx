import {Swiper, SwiperSlide} from 'swiper/react';
import Image from 'next/image';
import {FeatureInterface} from "../../interfaces/api.interface";
import {BasicData} from "../../interfaces/common.interface";
import {MouseEvent} from "react";
import 'swiper/css';

interface props {
  list: FeatureInterface[] | BasicData[];
  activeFeature: string;
  handleClick: (id: string) => void;
}

function optionList(props: props) {

  function selectFeature(e: MouseEvent, id: string) {
    e.preventDefault();
    props.handleClick(id);
  }

  return props.list.map((opt) => {
    return (
      <SwiperSlide className='flex flex-col items-center' key={opt.id}>
        <div
          className={'rounded-md transition duration-200 ease-in-out w-[40px] h-[40px] flex items-center justify-center' + (props.activeFeature == opt.id ? ' nm-flat-slate-100' : '')}
          onClick={(event: MouseEvent) => selectFeature(event, opt.id)}>
          <Image src={'/resources/icons/features/' + opt.id + '.svg'} width={25} height={25} alt={'test'}
                 className='opacity-80'/>
        </div>
        <p
          className={'text-[10px] pt-1 opacity-50' + (props.activeFeature == opt.id ? ' opacity-90 text-slate-700' : '')}>{opt.id}</p>
      </SwiperSlide>
    )
  });
}

export default function FeatureSelectorComponent(props: props) {
  return (
    <div className='w-full relative'>
      <div
        className='absolute h-full w-[50px] top-0 left-0 bg-gradient-to-r from-slate-100 z-10 pointer-events-none'></div>
      <p className='nm-flat-slate-100 hidden absolute'></p>
      <Swiper
        slidesPerView={6}
        centeredSlides={true}
        grabCursor={true}
        loop={true}
        // onSlideChange={() => console.log('slide change')}
        // onSwiper={(swiper) => console.log(swiper)}
        className='!pb-2 !pt-3'
      >
        {optionList(props)}
      </Swiper>
      <div
        className='absolute h-full w-[50px] top-0 right-0 bg-gradient-to-l from-slate-100 z-10 pointer-events-none'></div>
    </div>
  )
}