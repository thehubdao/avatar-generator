import { Swiper, SwiperRef } from 'swiper/react';
import { useRef } from "react";
import 'swiper/css';
import { FeatureBasic } from '../../../../interfaces/common.interface';
import FeatureOptionListUI from './featureOptionList.ui';
import { MOBILE_ITEMS_PER_VIEW } from '../../../../constants/mobile/swiperItemsPerView.constants';

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

  return (
    <div className='w-full relative'>
      <Swiper
        slidesPerView={MOBILE_ITEMS_PER_VIEW}
        centeredSlides={true}
        grabCursor={true}
        // loop={itemsLength < itemsPerView ? false : true} //! error with this prop on swipper lib (loop)
        // onSlideChange={() => console.log('slide change')}
        className='!pt-1'
        ref={swiperRef}
      >
        {FeatureOptionListUI({ list, activeOpc, handleClick: (id, index) => { handleSlide(id, index) } })}
      </Swiper>
      <div className='absolute w-full px-3' >
        <div className='w-full border-b-[1px] border-slate-300' />
      </div>
    </div >
  )
}