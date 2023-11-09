import { Swiper, SwiperRef } from 'swiper/react';
import { useRef } from "react";
import 'swiper/css';
import { FeatureBasic } from '../../../../interfaces/common.interface';
import FeatureOptionList from './featureOptionList.ui';
import { MOBILE_ITEMS_PER_VIEW } from '../../../../constants/mobile/swiper.constants';

interface FeatureSelectorComponentProps {
  list: FeatureBasic[];
  activeOpc: string;
  handleClick: (id: string) => void;
}

export default function FeatureSelectorComponent(props: FeatureSelectorComponentProps) {
  const swiperRef = useRef<SwiperRef>(null);

  const handleSlide = (id: string, index: number) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideToLoop(index, 1000);
    }

    props.handleClick(id);
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
        {FeatureOptionList({ ...props, handleClick: handleSlide })}
      </Swiper>
      <div className='absolute w-full px-3' >
        <div className='w-full border-b-[1px] border-slate-300' />
      </div>
    </div >
  )
} 