import { useEffect, useState } from "react";
import { FeatureInterface } from "../../../interfaces/api.interface";
import { GetFileUrl } from "../../../utils/firebase.util";
import Image from 'next/image';
import { BasicData } from "../../../interfaces/common.interface";

interface OptionSelectorProps {
  list?: FeatureInterface[],
  activeOption?: BasicData,
  handleClick: (id: string, path: string, name: string) => void;
}

interface OptionProps {
  option: FeatureInterface,
  isActive?: boolean
}

function GetOptionThumbnail({option}: OptionProps ) {
  const [imageUrl, setImageUrl] = useState<string>();
  
  useEffect(() => {
    (async () => {
      const newImage = await GetFileUrl(option.thumb);
      setImageUrl(newImage ?? undefined);
    })().catch(err => console.error(err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option])

  return (
    <>
      {imageUrl == undefined ?
        <div className="relative w-2/4 h-2/4">
          <Image src={'/resources/icons/features/default.svg'} fill sizes={'132px'} alt={option.name}/>
        </div>
        :
        <Image placeholder="blur" blurDataURL={imageUrl} src={imageUrl} fill sizes={'132px'} alt={option.name}/>
      }
    </>
  );
}

function OptionCard({ option, isActive }: OptionProps) {
  return (
    <div className={`w-[132px] h-[170px] rounded-lg overflow-hidden cursor-pointer`}>
      <div className="relative bg-[#3d3d3d] w-full h-[132px] flex justify-center items-center">
        <GetOptionThumbnail option={option} />
      </div>
      <div className={`w-full h-[38px] flex justify-center items-center ${isActive ? 'bg-accent' : 'bg-white'}`}>
        <p className={`font-poppins font-medium text-xs uppercase w-full px-2 text-center truncate ${isActive ? 'text-white' : 'text-gray-normal'}`}>{option.name}</p>
      </div>
    </div>
  )
}

export default function OptionSelector({ list, activeOption, handleClick }: OptionSelectorProps) {

  const selectFeature = (e: React.MouseEvent, opt: FeatureInterface) => {
    e.preventDefault();
    handleClick(opt.id, opt.path, opt.name);
  }

  return (
    <div className="flex flex-wrap flex-col gap-3 content-start overflow-x-auto h-[190px] min-[1440px]:h-[390px]">
      {
        list ?
          list.map(opt => {
            return (
              <div key={opt.id} onClick={event => selectFeature(event, opt)}>
                <OptionCard option={opt} isActive={activeOption && activeOption.val === opt.name} />
              </div>
            )
          })
          :
          <p>no options</p>
      }
    </div>
  )
}