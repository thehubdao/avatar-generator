import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import { BodyPartLocationApi } from "../../interfaces/api.interface";
import {BasicData} from "../../interfaces/common.interface";
import 'swiper/css';

// REFERENCE PALETTE: https://www.colourlovers.com/palette/2543931/Cartoon_Skin_2

interface props {
  list: string[];
  activeColor: string | undefined;
  handleClick: Function;
}

function optionList(props: props) {

  function selectPart(e:React.MouseEvent, color:string) {
    e.preventDefault();
    props.handleClick(color);
  }

  return props.list.map((opt) => {
    return (
      <SwiperSlide className='flex flex-col items-center'  key={opt}>
        <div className={'rounded-md transition duration-200 ease-in-out w-[50px] h-[50px] flex items-center justify-center' + (props.activeColor==opt?' nm-inset-slate-100':'')} onClick={(event:React.MouseEvent) => selectPart(event,opt)}>
          <div className='w-4/6 h-4/6 rounded-md' style={{backgroundColor: ('#'+opt)}}></div>
        </div>
        {/* <p className={'text-[10px] pt-1 opacity-50' + (props.activeColor==opt?' opacity-90 text-slate-700':'')}>{opt}</p> */}
      </SwiperSlide>
    )
  });
}

export default function ColorSelectorComponent( props: props) {
  return (
    <div className='w-full relative'>
      <div className='absolute h-full w-[50px] top-0 left-0 bg-gradient-to-r from-slate-100 z-10 pointer-events-none'></div>
      <p className='nm-flat-slate-100 hidden absolute'></p>
      <Swiper
        slidesPerView={5}
        centeredSlides={true}
        grabCursor={true}
        loop={true}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
        className='!pb-2 !pt-3 h-[79px]'
      >
        { optionList(props) }
      </Swiper>
      <div className='absolute h-full w-[50px] top-0 right-0 bg-gradient-to-l from-slate-100 z-10 pointer-events-none'></div>
    </div>
  )
}