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
import { CardSize } from '../../../enums/citizens/common.enum';
import { useAuthUi } from '@futureverse/auth-ui';

interface CampaignListProps {
  collections: CitizensCollection[];
  setSelectedCampaign: (electedCampaign: Campaign) => void;
}

export default function CampaignList({ collections, setSelectedCampaign }: CampaignListProps) {
  const { login } = usePrivy();
  const { openLogin, closeLogin, isLoginOpen } = useAuthUi();

  const handleCollectionClick = async (collection: CitizensCollection) => {
    try {
      const walletChainType = collection.blockChain?.toLowerCase() === BlockchainType.SOLANA
        ? 'solana-only'
        : 'ethereum-only';
      openLogin();
      /* login({ walletChainType }); */

      
    } catch (error) {
      console.error('Error during login:', error)
    }
  };

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
                  console.log("COLLECTION", el)
                  setSelectedCampaign(el.campaign)
                  await handleCollectionClick(el)
                  
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
{/*         <SwiperSlide>
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
        </SwiperSlide> */}
      </Swiper>

    </div>
  )
}