import { Swiper, SwiperSlide } from "swiper/react";
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";

// Import Swiper styles
import 'swiper/css';

interface CampaignListProps {
  collections: CitizensCollection[];
  handleCardSelection?: () => void;
}

export default function CampaignList({ collections, handleCardSelection }: CampaignListProps) {
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
              {/* <ConnectWeb3Button classStyles="w-full h-full" setIsSigned={() => {if(handleCardSelection) handleCardSelection()}} >
                <CampaignCard title={el.name} imgSrc={el.image} imgAlt={el.name} overlayText="LOG IN" />
              </ConnectWeb3Button> */}
              <CampaignCard title={el.name} imgSrc={el.image} imgAlt={el.name} overlayText="LOG IN" handleClick={() => {if(handleCardSelection) handleCardSelection()}}/>
            </SwiperSlide>
          ))
        }
      </Swiper>

    </div>
  )
}