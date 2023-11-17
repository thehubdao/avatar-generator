import { useRef } from "react";
import { MouseEvent } from "react";
import 'swiper/css';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { FeatureBasic } from '../../../../interfaces/common.interface';
import FeatureItemUI from './featureItem.ui';
import { MOBILE_FEATURE_OPTIONS_PER_VIEW } from '../../../../constants/ui.constant';

interface FeatureSelectorUIProps {
  list: FeatureBasic[];
  activeOpc: string;
  handleClick: (id: string) => void;
}

export default function FeatureSelectorUI({ activeOpc, handleClick, list }: FeatureSelectorUIProps) {
  const swiperRef = useRef<SwiperRef>(null);

  const handleSlide = (id: string, index: number) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideToLoop(index, 1000);
    }

    handleClick(id);
  };

  function selectFeature(e: MouseEvent, id: string, index: number) {
    e.preventDefault();
    handleSlide(id, index);
  }

  return (
    <div className='w-full relative'>
      <Swiper
        slidesPerView={MOBILE_FEATURE_OPTIONS_PER_VIEW}
        centeredSlides={true}
        grabCursor={true}
        className='!pt-1'
        ref={swiperRef}
      >
        {list.map((feature, index) => (
          <SwiperSlide className='flex flex-col items-center justify-center' onClick={(event) => selectFeature(event, feature.displayName, index)} key={index}>
            <FeatureItemUI
              key={index}
              feature={feature}
              isActive={activeOpc == feature.displayName}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className='absolute w-full px-3' >
        <div className='w-full border-b-[1px] border-slate-300' />
      </div>
    </div >
  )
}