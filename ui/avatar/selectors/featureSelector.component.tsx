import { Swiper, SwiperRef, SwiperSlide, useSwiper } from 'swiper/react';
import { FeatureBasic } from "../../../interfaces/common.interface";
import { useRef } from "react";
import FeatureItemSelectorUI from "./featureItemSelector.ui";
import { MouseEvent } from "react";
import {Mousewheel} from "swiper/modules";

interface FeatureSelectorProps {
  list?: FeatureBasic[];
  activeOpc?: string;
  onCategoryChange: (name: string) => void;
  // TODO: remove since the git history has it
  // onChangeFeature: (name: string) => void;
  // onChangeAccessory: (name: string) => void;
}

// TODO: move component to own file
function ScrollButton({ position = 'top' }: { position?: 'top' | 'bottom' }) {
  const swiper = useSwiper();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    position === 'top' ? swiper.slidePrev() : swiper.slideNext();
  }

  let boxStyle = ''
  if (position === 'top') {
    boxStyle = 'top-0'
  } else if (position === 'bottom') {
    boxStyle = 'bottom-0 rotate-180'
  }

  return (
    <div className={`absolute h-fit ${boxStyle} z-10`}>
      <button
        onClick={handleClick}
        className="bg-bg flex justify-center items-center w-[148px] h-[80px]"
      >
        <div className={`-rotate-[135deg] w-4 h-4 border-r-[5px] border-b-[5px]`} />
      </button>
      <div className="bg-gradient-to-b from-slate-100 w-full h-[8px]" />
    </div>
  )
}

export default function FeatureSelector({ list, activeOpc, onCategoryChange }: FeatureSelectorProps) {
  const swiperRef = useRef<SwiperRef | null>(null);

  const listLenght: number = list?.length ?? 0

  const handleSlide = (id: number) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideToLoop(id, 1000);
    }
  };

  return (
    <div className="relative h-fit">
      <Swiper
        slidesPerView='auto'
        spaceBetween={10}
        centeredSlides={true}
        direction={"vertical"}
        modules={[Mousewheel]}
        mousewheel={true}
        ref={swiperRef}
        initialSlide={Math.floor(listLenght / 2)}
        className='!pb-2 !pt-3 h-screen'
      >
        {
          list ?
            list.map((item: FeatureBasic, index: number) => {
              return (
                <SwiperSlide key={index} style={{ height: '100px' }} className="px-8">
                  <FeatureItemSelectorUI
                    item={item}
                    handleClick={(name: string) => {
                      onCategoryChange(name);
                      handleSlide(index);
                    }}
                    activeOpc={activeOpc}
                  />
                </SwiperSlide>
              )
            })
            :
            <p>no features</p>
        }
        <ScrollButton position="top" />
        <ScrollButton position="bottom" />
      </Swiper>
    </div>
  )
}