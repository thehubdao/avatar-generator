import React, { useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";

// Import Swiper styles
import 'swiper/css';
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";

interface CampaignListProps {
  collections: CitizensCollection[];
  setIsSigned: (isSigned: boolean) => void;
}

export default function CampaignList({ collections, setIsSigned }: CampaignListProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  return (
    <div className="w-full mx-auto">
      <Swiper
        spaceBetween={40}
        slidesPerView={'auto'}
        centeredSlides={true}
        initialSlide={1}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
        className="collection_swiper"
      >
        {
          collections.map((el, i) => (
            <SwiperSlide key={i} className="w-96">
              <ConnectWeb3Button
                classStyles="w-full h-full"
                setIsSigned={setIsSigned}
                setIsConnecting={setIsConnecting}
                setIsSigning={setIsSigning}
                setIsVerifying={setIsVerifying}
                isConnecting={isConnecting}
                isSigning={isSigning}
                isVerifying={isVerifying}
              >
                <CampaignCard
                  title={el.name}
                  imgSrc={el.image}
                  imgAlt={el.name}
                  overlayText={
                    isConnecting
                      ? "Connecting..."
                      : isSigning
                        ? "Signing..."
                        : isVerifying
                          ? "Verifying..."
                          : "LOG IN"
                  }
                />
              </ConnectWeb3Button>
              {/* <CampaignCard title={el.name} imgSrc={el.image} imgAlt={el.name} overlayText="LOG IN" handleClick={() => {if(handleCardSelection) handleCardSelection()}}/> */}
            </SwiperSlide>
          ))
        }
        <SwiperSlide className="w-96"><CampaignCard
          title={'Based Citizens'}
          imgSrc={'/resources/images/campaings/coming_soon.jpg'}
          imgAlt={'Based Citizens'}
          overlayText={
            'Coming Soon'
          }
        /></SwiperSlide>

      </Swiper>

    </div>
  )
}