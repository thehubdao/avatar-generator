import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import { BodyPartLocationApi } from "../../interfaces/api.interface";
import {BasicData} from "../../interfaces/common.interface";
import 'swiper/css';

interface props {
  list: BodyPartLocationApi[] | BasicData[];
  activedPart: string;
  handleClick: Function;
}

function optionList(props: props) {

  function selectPart(e:React.MouseEvent, id:string) {
    e.preventDefault();
    props.handleClick(id);
  }

  return props.list.map((opt) => {
    return (
      <SwiperSlide className='flex flex-col items-center'  key={opt.id}>
        <div className={'rounded-md transition duration-200 ease-in-out w-[40px] h-[40px] flex items-center justify-center' + (props.activedPart==opt.id?' nm-flat-slate-100':'')} onClick={(event:React.MouseEvent) => selectPart(event,opt.id)}>
          <Image src={'/resources/icos/features/' + opt.id + '.svg'} width={25} height={25} alt={'test'} className='opacity-80'/>
        </div>
        <p className={'text-[10px] pt-1 opacity-50' + (props.activedPart==opt.id?' opacity-90 text-slate-700':'')}>{opt.id}</p>
      </SwiperSlide>
    )
  });
}

export default function FeatureSelectorComponent( props: props) {
  return (
    <div className='w-full border-t-2 border-slate-50'>
      <p className='nm-flat-slate-100 hidden absolute'></p>
      <Swiper
        slidesPerView={6}
        centeredSlides={true}
        grabCursor={true}
        loop={true}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
        className='!pb-2 !pt-3'
      >
        { optionList(props) }
      </Swiper>
    </div>
  )
}