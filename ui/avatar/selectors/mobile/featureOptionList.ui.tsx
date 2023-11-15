import { SwiperSlide } from "swiper/react";
import { FeatureBasic } from "../../../../interfaces/common.interface";
import { MouseEvent } from "react";

interface FeatureOptionListUIProps {
  list: FeatureBasic[];
  activeOpc: string;
  handleClick: (id: string, index: number) => void;
}

export default function FeatureOptionListUI({ list, activeOpc, handleClick }: FeatureOptionListUIProps) {

  function selectFeature(e: MouseEvent, id: string, index: number) {
    e.preventDefault();
    handleClick(id, index);
  }

  return list?.map((opt: FeatureBasic, index: number) => {
    return (
      <SwiperSlide className='flex flex-col items-center justify-center' key={index} onClick={(event: MouseEvent) => selectFeature(event, opt.displayName, index)}>
        <p className={'text-xs text-center p-2 opacity-50 truncate' + (activeOpc == opt.displayName ? ' opacity-90 text-slate-700 border-b-[1px] border-slate-700' : '')}>
          {opt.displayName.toUpperCase()}
        </p>
      </SwiperSlide>
    )
  });
}