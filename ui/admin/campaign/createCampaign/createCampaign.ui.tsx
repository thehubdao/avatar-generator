import { useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';

import { AiOutlineCheckCircle, AiOutlineCloudUpload } from "react-icons/ai";

import AvatarBaseStep from "./avatarBaseStep.ui";
import AssetsCountStep from "./assetsCountStep.ui";
import FeaturesConfig from "./featuresConfigStep.ui";
import ConfirmationStep from "./confirmationStep.ui";

import { setName } from "../../../../store/addCampaignSlice";

interface AddCampaignProps {
  setAvatarBaseFile: (file: File | undefined) => Promise<void>;
}

export default function AddCampaign({setAvatarBaseFile}: AddCampaignProps) {
  const name = useAppSelector(state => state.addCampaign.name);
  const dispatch = useAppDispatch();
  
  const campaignNameInput = useRef<HTMLInputElement>(null);
  const campaignBaseInput = useRef<HTMLInputElement>(null);
  const [hasCampaignName, setHasCampaignName] = useState<boolean>(false);
  const [hasCampaignBase, setHasCampaignBase] = useState<boolean>(false);

  const [shouldEditName, setShouldEditName] = useState<boolean>(true)
  const [featuresCount, setFeaturesCount] = useState<number>(1);

  function checkCampaignName() {
    if (campaignNameInput.current?.value == '') {
      setHasCampaignName(false);
    } else {
      setHasCampaignName(true);
    }
  }

  function checkCampaignBase() {
    const fileLength = campaignBaseInput.current?.files?.length;
    if (!fileLength || fileLength < 1) {
      setHasCampaignBase(false);
    } else {
      setHasCampaignBase(true);
    }
  }

  async function onSubmit() {
    await setAvatarBaseFile(campaignBaseInput.current?.files?.item(0) ?? undefined);
  }

  return (
    <>
      <div>
        <h1 className="font-humane text-9xl text-gray-normal">CREATE CAMPAIGN:</h1>
        <div>
          <input
            defaultValue={name}
            ref={campaignNameInput}
            className="font-poppins font-bold text-7xl text-gray-normal uppercase bg-transparent border-l border-gray-light outline-none pl-2"
            type="text"
            name="newCampaignName"
            id="newCampaignName"
            autoFocus
            autoComplete="off"
            placeholder="NAME"
            onChange={checkCampaignName}
            disabled={!shouldEditName}
          />
          {hasCampaignName ?
            <p>Campaigns are the container for a personalization system. A campaign is formed by
              <span className="text-purple font-bold"> AVATAR BASE</span> and
              <span className="text-orange font-bold"> FEATURES</span> initially.</p>
            :
            <label htmlFor="newCampaignName" className="block text-gray-light cursor-pointer">Set the campaign&apos;s name.</label>
          }

        </div>
        {hasCampaignName &&
          <div className="pt-10 flex gap-2">
            <div className="rounded-2xl h-96 w-3/5 flex flex-col justify-center items-center shadow-inset-medium hover:shadow-inset-hard overflow-hidden transition-all duration-300">
              <div className="w-full h-full p-2 flex justify-center items-center">
                <label className="flex justify-center items-center bg-bg rounded-lg cursor-pointer shadow-flat-soft hover:shadow-flat-hard w-56 h-56 hover:w-11/12 hover:h-[85%] transition-all duration-1000 group" htmlFor="newCampaignBase">
                  <div className={`flex gap-10 p-10 font-humane text-9xl text-gray-light ${hasCampaignBase ? 'group-hover:text-green-400':'group-hover:text-purple'} transition-all duration-1000`}>
                    {
                      hasCampaignBase ?
                      <AiOutlineCheckCircle/>
                      :
                      <AiOutlineCloudUpload/>
                    }
                  </div>
                  <input type="file" id="newCampaignBase" ref={campaignBaseInput} className="hidden" accept=".glb" onChange={checkCampaignBase} />
                </label>
              </div>
            </div>
            <div className="relative w-2/5">
              <Swiper
                slidesPerView={1}
                spaceBetween={60}
                allowTouchMove={false}
                className="min-h-96"
              >
                <SwiperSlide style={{ minHeight: 384 }}>
                  <AvatarBaseStep ready={hasCampaignName && hasCampaignBase} handleNextStep={() => {
                    dispatch(setName(campaignNameInput.current?.value || ''));
                    setShouldEditName(false);
                  }}/>
                </SwiperSlide>
                <SwiperSlide style={{ minHeight: 384 }}>
                  <AssetsCountStep ready={true} handleNextStep={(value) => setFeaturesCount(value)} handleBackStep={() => setShouldEditName(true)} />
                </SwiperSlide>
                <SwiperSlide style={{ minHeight: 384 }}>
                  <FeaturesConfig ready={true} featuresCount={featuresCount} />
                </SwiperSlide>
                <SwiperSlide style={{ minHeight: 384 }}>
                  <ConfirmationStep handleNextStep={() => onSubmit()}/>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        }
      </div>
    </>
  )
}