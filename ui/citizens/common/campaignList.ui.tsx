import { Swiper, SwiperSlide } from "swiper/react";
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import CampaignCard from "./campaignCard.ui";

// Import Swiper styles
import 'swiper/css';

interface CampaignListProps {
  collections: CitizensCollection[];

}

export default function CampaignList({ collections }: CampaignListProps) {
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
              <CampaignCard title={el.name} imgSrc={el.image} imgAlt={el.name} />
            </SwiperSlide>
          ))
        }
      </Swiper>

    </div>
  )
}