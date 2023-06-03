import Image from "next/image";
import { Swiper, SwiperRef, SwiperSlide, useSwiper } from 'swiper/react';
import { Mousewheel } from 'swiper'
import { FeatureInterface } from "../../../interfaces/api.interface";
import { BasicData } from "../../../interfaces/common.interface";
import { useRef } from "react";

interface FeatureSelectorProps {
  list?: FeatureInterface[] | BasicData[];
  activeOpc?: string;
  handleClick: (id: string) => void;
}

interface OptionSelectorProps {
  list?: FeatureInterface[] | BasicData[];
  activeOpc?: string
  handleClick: (id: string) => void;
  handleSlide: (id: number) => void;
}

const ScrollButton = ({ position = 'top' }: { position?: 'top' | 'bottom' }) => {
  const swiper = useSwiper();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
        className="bg-bg flex justify-center items-center w-[164px] h-[80px]"
      >
        <div className={`-rotate-[135deg] w-4 h-4 border-r-[5px] border-b-[5px]`} />
      </button>
      <div className="bg-gradient-to-b from-slate-100 w-full h-[8px]" />
    </div>
  )
}

function optionSelector({ list, activeOpc, handleClick, handleSlide }: OptionSelectorProps) {
  const selectFeature = (e: React.MouseEvent, id: string, index: number) => {
    e.preventDefault();
    handleClick(id);
    handleSlide(index);
  }

  return list?.map((opt: any, index: number) => {
    const isActive: boolean = activeOpc && activeOpc === opt.id ? true : false
    return (
      <SwiperSlide key={opt.id} style={{ height: '110px' }} className="px-8">
        <div
          onClick={event => {
            selectFeature(event, opt.id, index)
          }}
        >
          <div className={`w-[100px] h-[100px] flex justify-center items-center bg-bg rounded-xl cursor-pointer ${isActive ? 'bg-accent shadow-inset-hard' : 'shadow-flat-hard'}`} title={opt.id}>
            <Image alt={opt.id} width={70} height={70} src={'/resources/icons/features/Chest.svg'} priority />
          </div>
        </div>
      </SwiperSlide>
    )
  })
}

export default function FeatureSelector({ list, activeOpc, handleClick }: FeatureSelectorProps) {
  const swiperRef = useRef<SwiperRef | null>(null);

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
        loop={true}
        modules={[Mousewheel]}
        mousewheel={true}
        ref={swiperRef}
        // onSlideChange={() => console.log('slide change')}
        // onSwiper={(swiper) => console.log(swiper)}
        className='!pb-2 !pt-3 h-screen'
      >
        {optionSelector({ list, activeOpc, handleClick, handleSlide })}
        <ScrollButton position="top" />
        <ScrollButton position="bottom" />
      </Swiper>
    </div>
  )
}