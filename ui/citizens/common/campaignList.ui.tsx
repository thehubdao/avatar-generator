import React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";
import { usePrivy } from '@privy-io/react-auth';

// Import Swiper styles
import 'swiper/css';
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
import { Campaign } from '../../../types/metadata.type';
import { BlockchainType } from '../../../hooks/useBlockchainWallet';

interface CampaignListProps {
  collections: CitizensCollection[];
  setSelectedCampaign: (electedCampaign: Campaign) => void;
}

export default function CampaignList({ collections, setSelectedCampaign }: CampaignListProps) {
  const { login } = usePrivy();

  const handleCollectionClick = async (collection: CitizensCollection) => {
    try {
      const walletChainType = collection.blockChain?.toLowerCase() === BlockchainType.SOLANA
        ? 'solana-only'
        : 'ethereum-only';

      login({ walletChainType });

      ;
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="w-full mx-auto">
      <Swiper
        spaceBetween={40}
        slidesPerView={'auto'}
        centeredSlides={true}
        initialSlide={Math.floor(collections.length / 2)}
        className="collection_swiper"
      >
        {
          collections.map((el, i) => (
            <SwiperSlide key={i} className="w-96">
              <ConnectWeb3Button
                classStyles="w-full h-full"
                onClick={async () => {
                  console.log("COLLECTION", el)
                  await handleCollectionClick(el)
                  setSelectedCampaign(el.campaign)
                }}
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
{/*         <SwiperSlide className="w-96"><CampaignCard
          title={'Based Citizens'}
          imgSrc={'/resources/images/campaings/based_citizens.png'}
          imgAlt={'Based Citizens'}
          overlayText={
            'Coming Soon'
          }
        /></SwiperSlide> */}

      </Swiper>

    </div>
  )
}