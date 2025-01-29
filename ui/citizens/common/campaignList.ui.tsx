import React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";

// Import Swiper styles
import 'swiper/css';
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
import { Campaign } from '../../../types/metadata.type';

interface CampaignListProps {
  collections: CitizensCollection[];
  setIsSigned: (isSigned: boolean, selectedCampaign: Campaign) => void;
}

export default function CampaignList({ collections, setIsSigned }: CampaignListProps) {

  return (
    <div className="w-full mx-auto">
      <Swiper
        spaceBetween={40}
        slidesPerView={'auto'}
        centeredSlides={true}
        initialSlide={Math.floor(collections.length/2)}
        breakpoints={{
          1024: {
            initialSlide: 1
          },
        }}
        className="collection_swiper"
      >
        {
          collections.map((el, i) => (
            <SwiperSlide key={i} className="w-96">
              <ConnectWeb3Button
                classStyles="w-full h-full"
                setIsSigned={(isSigned: boolean) => setIsSigned(isSigned, el.campaign)}
              >
                <CampaignCard
                  title={el.name}
                  imgSrc={el.image}
                  imgAlt={el.name}
                  overlayText={
                    "LOG IN"
                  }
                />
              </ConnectWeb3Button>
            </SwiperSlide>
          ))
        }
        <SwiperSlide className="w-96"><CampaignCard
          title={'Based Citizens'}
          imgSrc={'/resources/images/campaings/based_citizens.png'}
          imgAlt={'Based Citizens'}
          overlayText={
            'Coming Soon'
          }
        /></SwiperSlide>

      </Swiper>

    </div>
  )
}