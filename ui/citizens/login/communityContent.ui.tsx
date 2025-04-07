import { LOGIN_COMMUNITY } from "../../../constants/citizens.constant";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import 'swiper/css';

export default function CommunityContent() {
  return (
    <Swiper
      spaceBetween={10}
      slidesPerView={1}
      initialSlide={0}
      autoplay={{
        delay: 2500,
        disableOnInteraction: true,
      }}
      breakpoints={{
        768: {
          slidesPerView: 2,
        },
        1280: {
          slidesPerView: 3,
        },
        1536: {
          slidesPerView: 4,
        },
      }}
      modules={[Autoplay]}
    >
      {
        LOGIN_COMMUNITY.map((item, index) => (
          <SwiperSlide key={index} className="!flex justify-center px-6">
            <div className="relative w-[478px] h-[374px] rounded-[30px] overflow-hidden cursor-pointer">
              <Image src={`/resources/images/citizens/community/${item.img}.jpg`} priority alt={item.img} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            </div>
          </SwiperSlide>
        ))
      }
    </Swiper>
  )
}