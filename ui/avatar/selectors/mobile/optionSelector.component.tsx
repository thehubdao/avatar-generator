import {Swiper, SwiperSlide} from 'swiper/react';
import Image from 'next/image';
import {FeatureInterface} from "../../../../interfaces/api.interface";
import 'swiper/css';
import {BasicData} from '../../../../interfaces/common.interface';
import {useEffect, MouseEvent, useState} from 'react';
import {GetFileUrl} from "../../../../utils/firebase.util";

interface Props {
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
      const result = await GetFileUrl(opt.thumb);
      if (result.success) setImageUrl(result.value ?? undefined);
    })
  }, [opt])

  return (
    <>
      {imageUrl == undefined ?
        <div className='w-[75px] h-[75px] rounded-md overflow-hidden flex justify-center items-center bg-gray-700 blur-md'>
          <Image src={'/resources/icons/features/default.svg'} width={75} height={75} alt={opt.name}/>
        </div> :
        <div className='w-[75px] h-[75px] rounded-md overflow-hidden flex justify-center items-center bg-gray-700'>
          <Image placeholder="blur" blurDataURL="/resources/icons/features/default.svg"
                 src={imageUrl} width={75} height={75} alt={opt.name}/>
        </div>
      }
    </>
  );
}

function OptionList({list, activeOption, handleClick}: Props) {
  function selectFeature(e: MouseEvent, opt: FeatureInterface) {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }
  
  return list != undefined ? 
    list.map((opt: FeatureInterface, index: number) => {
      return (
        <SwiperSlide className={'flex justify-center items-center transition-transform' + (activeOption?.val === opt.name?' -translate-y-2':'')} key={index}>
          <p className='nm-flat-slate-100 hidden absolute'></p>
          <div className="rounded-md w-[75px] h-[75px] flex items-center justify-center relative overflow-hidden" onClick={event => selectFeature(event, opt)}>
            <OptionThumbnail opt={opt}/>
            <p className='text-[10px] px-2 absolute bottom-0 right-0 bg-slate-100 max-w-full rounded-tl-md overflow-hidden whitespace-nowrap'>{opt.name}</p>
            <div className={'w-2 h-2 absolute top-1 right-1 rounded-full bg-green-400 border border-green-600 opacity-0' + (activeOption?.val === opt.name?'  opacity-100':'')}></div>
          </div>
        </SwiperSlide>
      )
    }) : <></>;
}

export default function OptionSelectorComponent(props: Props) {
  const itemsLength = props.list?.length ? props.list.length : 1;
  const itemsPerView = 4;
  return (
    <div className='w-full'>
      <Swiper slidesPerView={itemsPerView}
              grabCursor={true}
              loop={itemsLength < itemsPerView ? false : true}
              className='!py-2'>
        {OptionList(props)}
      </Swiper>
    </div>
  )
}

