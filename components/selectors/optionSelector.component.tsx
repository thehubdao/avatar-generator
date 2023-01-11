import {Swiper, SwiperSlide} from 'swiper/react';
import Image from 'next/image';
import {FeatureInterface} from "../../interfaces/api.interface";
import 'swiper/css';
import {BasicData} from '../../interfaces/common.interface';
import {useEffect, MouseEvent, useState} from 'react';
import {GetFileUrl} from "../../utils/firebase.util";

interface props {
  list?: FeatureInterface[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

// TODO: please place this things in their own folder
interface OptionProps {
  opt: FeatureInterface;
}

// TODO: please use a real name that actually describes something
function OptionThumbnail({opt}: OptionProps) {
  const [imageUrl, setImageUrl] = useState<string>();
  
  useEffect(() => {
    (async () => {
      const newImage = await GetFileUrl(opt.thumb);
      setImageUrl(newImage ?? '/resources/images/image.png');
    })().catch(err => console.error(err));
  }, [opt])

  return (
    <>
      {imageUrl == undefined ?
        <div className='w-[75px] h-[75px] rounded-md overflow-hidden flex justify-center items-center bg-gray-700 blur-md'>
          <Image src={'/resources/images/image.png'} width={75} height={75} alt={opt.name}/>
        </div> :
        <div className='w-[75px] h-[75px] rounded-md overflow-hidden flex justify-center items-center bg-gray-700'>
          <Image placeholder="blur" blurDataURL="/resources/images/image.png"
                 src={imageUrl} width={75} height={75} alt={opt.name}/>
        </div>
      }
    </>
  );
}

function OptionList({list, activeOption, handleClick}: props) {
  function selectFeature(e: MouseEvent, opt: FeatureInterface) {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }

  useEffect(() => {
    console.log("active option: ", activeOption);
  }, [activeOption]);
  // console.log("active option: ", activeOption);
  return list.map((opt) => {
    return (
      <SwiperSlide className={'flex justify-center items-center transition-transform' + (activeOption?.val === opt.name?' -translate-y-2':'')} key={opt.id}>
        <p className='nm-flat-slate-100 hidden absolute'></p>
        <div className="rounded-md w-[75px] h-[75px] flex items-center justify-center relative overflow-hidden" onClick={(event:MouseEvent) => selectPart(event,opt)}>
          <OptionThumbnail opt={opt}/>
          <p className='text-[10px] px-2 absolute bottom-0 right-0 bg-slate-100 max-w-full rounded-tl-md'>{opt.name}</p>
          <div className={'w-2 h-2 absolute top-1 right-1 rounded-full bg-green-400 border border-green-600 opacity-0' + (activeOption?.val === opt.name?'  opacity-100':'')}></div>
        </div>
      </SwiperSlide>
    )
  });
}

export default function OptionSelectorComponent(props: props) {
  return (
    <div className='w-full'>
      <Swiper
        slidesPerView={4}
        grabCursor={true}
        loop={true}
        // onSlideChange={() => console.log('slide change')}
        // onSwiper={(swiper) => console.log(swiper)}
        className='!py-2'
      >
        {OptionList(props)}
      </Swiper>
    </div>
  )
}

