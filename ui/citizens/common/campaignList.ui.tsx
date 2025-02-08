import React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";

// Import Swiper styles
import 'swiper/css';
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
import { Campaign } from '../../../types/metadata.type';
import { CardSize } from '../../../enums/citizens/common.enum';

interface CampaignListProps {
  collections: CitizensCollection[];
  setIsSigned: (isSigned: boolean, selectedCampaign: Campaign) => void;
}

export default function CampaignList({ collections, setIsSigned }: CampaignListProps) {

  return (
    <div className="w-full mx-auto">
      <Swiper
        spaceBetween={60}
        slidesPerView={'auto'}
        centeredSlides={true}
        initialSlide={Math.floor(collections.length / 2)}
        className='login_swiper'
      >
        {
          collections.map((el, i) => (
            <SwiperSlide key={i} >
              <ConnectWeb3Button
                classStyles=""
                setIsSigned={(isSigned: boolean) => setIsSigned(isSigned, el.campaign)}
              >
                <CampaignCard
                  title={el.name}
                  imgSrc={el.image}
                  imgAlt={el.name}
                  overlayText={
                    "LOG IN"
                  }
                  size={CardSize.Big}
                />
              </ConnectWeb3Button>
            </SwiperSlide>
          ))
        }
        <SwiperSlide>
          <CampaignCard
            title={'Based Citizens'}
            imgSrc={'/resources/images/campaings/based_citizens.jpg'}
            imgAlt={'Based Citizens'}
            overlayText={
              'Coming Soon'
            }
            size={CardSize.Big}
          />
        </SwiperSlide>
        <SwiperSlide>
          <CampaignCard
            title={'KUMI Citizens'}
            imgSrc={'/resources/images/campaings/kumi_collection.jpg'}
            imgAlt={'Kumi Citizens'}
            overlayText={
              'Coming Soon'
            }
            size={CardSize.Big}
          />
        </SwiperSlide>
      </Swiper>

    </div>
  )
}