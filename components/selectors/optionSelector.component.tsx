import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import { BodyPartLocationApi } from "../../interfaces/api.interface";
import 'swiper/css';

interface props {
  list: BodyPartLocationApi[];
  handleClick: Function;
}

function optionList(props: props) {
  function selectPart(e:React.MouseEvent, opt: BodyPartLocationApi) {
    e.preventDefault();
    props.handleClick(opt.id, opt.path, opt.name);
  }

  return props.list.map((opt) => {
    return (
      <SwiperSlide className='flex justify-center items-center group hover:-translate-y-2 transition-transform' key={opt.id}>
        <p className='nm-flat-slate-100 hidden absolute'></p>
        <div className="rounded-md w-[75px] h-[75px] flex items-center justify-center relative overflow-hidden" onClick={(event:React.MouseEvent) => selectPart(event,opt)}>
          <div className='w-[75px] h-[75px] rounded-md overflow-hidden flex justify-center items-center'>
            {/* <Image src={'/resources/icos/features/' + opt.type + '.svg'} width={50} height={50} alt={opt.name}/> */}
            <Image src={'/resources/images/image.png'} width={75} height={75} alt={opt.name}/>
          </div>
          <p className='text-[10px] px-2 absolute bottom-0 right-0 bg-slate-100 max-w-full rounded-tl-md'>{opt.name}</p>
          <div className='w-2 h-2 absolute top-1 right-1 rounded-full bg-green-400 border border-green-600 hidden group-hover:block'></div>
        </div>
      </SwiperSlide>
    )
  });
}

export default function OptionSelectorComponent( props: props) {
  return (
    <div className='w-full'>
      <Swiper
        slidesPerView={4}
        grabCursor={true}
        loop={true}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
        className='!py-2'
      >
        { optionList(props) }
      </Swiper>
    </div>
  )
}

