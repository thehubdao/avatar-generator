import CampaignCard from "../common/campaignCard.ui";
import { LOGIN_FRESHDROPS } from "../../../constants/citizens.constant";
import { Campaign, CardSize } from "../../../enums/citizens/common.enum";
import { Blockchain } from "../../../enums/blockchain/common.enum";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import 'swiper/css';

interface FreshDropsUIProps {
  setSelectedCampaign: (blockchain: Blockchain | undefined, campaign: Campaign | undefined) => void;
}

export default function FreshDropsUI({setSelectedCampaign}: FreshDropsUIProps) {
  return (
    <div className="py-12 px-6">
      <Swiper
        spaceBetween={40}
        slidesPerView={1}
        initialSlide={0}
        autoplay={{
          delay: 2500,
          disableOnInteraction: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
          1280: {
            slidesPerView: 4,
          },
          1536: {
            slidesPerView: 6,
          },
        }}
        modules={[Autoplay]}
      >
        {
          LOGIN_FRESHDROPS.map((drop, index) => (
            <SwiperSlide key={index} className="!flex justify-center">
              <CampaignCard
                key={index}
                title={drop.text}
                imgSrc={`/resources/images/citizens/freshdrops/${drop.img}.png`}
                imgAlt={'alt'}
                size={CardSize.Small}
                light
                overlayText={"LOG IN TO CLAIM"}
                handleClick={() => setSelectedCampaign(drop.blockChain, drop.campaign)}
              />
            </SwiperSlide>
          ))
        }
      </Swiper>
    </div>
  )
}