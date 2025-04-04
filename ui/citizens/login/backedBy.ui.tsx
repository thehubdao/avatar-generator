import Link from "next/link";
import { LOGIN_BACKEDBY } from "../../../constants/citizens.constant";
import Image from "next/image";

export default function BackedBy() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-0 gap-y-6 mx-6 md:mx-12 xl:mx-32 2xl:mx-80 place-items-center">
      {
        LOGIN_BACKEDBY.map((item, index) => (
          <Link key={index} href={item.link} target="_blank" className="bg-[#2B2B2B] rounded-2xl">
            <div className="relative w-[260px] h-[100px]">
              <Image src={`/resources/images/citizens/backedby/${item.img}.png`} fill alt={item.img} />
            </div>
          </Link>
        ))
      }
    </div>
  )
}