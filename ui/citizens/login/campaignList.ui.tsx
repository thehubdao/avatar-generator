import React from 'react';
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import CampaignCard from "../common/campaignCard.ui";
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
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
              <ConnectWeb3Button
                classStyles="w-full h-full"
                onClick={async () => {
                  handleClick(el.blockChain, el.campaign);
                }}
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
      </Swiper>
    </div>
  )
}