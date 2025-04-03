import { LOGIN_NEWS } from "../../../constants/citizens.constant";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import 'swiper/css';

export default function NewsUI() {
  return (
    <div className="pt-8">
      <Swiper
        spaceBetween={40}
        slidesPerView={1}
        initialSlide={0}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: true,
        }}
        breakpoints={{
          1280: {
            slidesPerView: 2
          },
          1536: {
            slidesPerView: 3
          },
        }}
        modules={[Autoplay]}
      >
        {
          LOGIN_NEWS.map((item, index) => (
            <SwiperSlide key={index} className="w-96">
              <Link href={item.link} target="_blank" className="flex justify-center">
                <div className="relative w-[320px] sm:w-[550px] h-[169px] sm:h-[290px]">
                  <Image src={`/resources/images/citizens/news/${item.img}.png`} fill alt={item.img} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
                </div>
              </Link>
            </SwiperSlide>
          ))
        }
      </Swiper>
    </div>
  )
}