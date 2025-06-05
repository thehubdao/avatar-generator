import React from 'react';
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import CampaignCard from "../common/campaignCard.ui";
import { Campaign } from '../../../enums/citizens/common.enum';
import { Blockchain } from '../../../enums/blockchain/common.enum';
import { CardSize } from '../../../enums/citizens/common.enum';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';

interface CampaignListProps {
  collections: CitizensCollection[];
  handleClick: (blockchain: Blockchain | undefined, campaign: Campaign | undefined) => void;
}

export default function CampaignList({ collections, handleClick }: CampaignListProps) {

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
              <CampaignCard
                title={el.name}
                imgSrc={el.image}
                imgAlt={el.name}
                overlayText={
                  el.active ? "LOG IN":"COMING SOON"
                }
                size={CardSize.Big}
                handleClick={() =>{ if(el.active) handleClick(el.blockChain, el.campaign)}}
              />
            </SwiperSlide>
          ))
        }
      </Swiper>
    </div>
  )
}