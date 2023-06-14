import { IoAlert } from "react-icons/io5";
import AGButton from "../../../common/ag-button.component";
import { useSwiper } from "swiper/react";

interface FirstStepInterface {
  ready: boolean,
  handleNextStep: () => void;
}

export default function FirstStep({ ready = false, handleNextStep }: FirstStepInterface) {
  const swiper = useSwiper();
  return (
    <div className="flex flex-col justify-between px-5">
      <div className="pb-20">
        <h2 className="text-2xl text-purple font-poppins font-bold">AVATAR BASE (AB)</h2>
        <p>The <span className="text-purple font-bold">AB</span> is the reference for all of the avatar features.</p>
        <div className="relative bg-purple p-5 rounded-r-2xl rounded-bl-lg rounded-t- mt-5 flex gap-5">
          <div className="absolute top-0 -left-3 border-8 border-l-transparent border-b-transparent border-purple"></div>
          <div className="w-10 h-10 text-4xl text-purple bg-white rounded-full flex justify-center items-center">
            <IoAlert />
          </div>
          <div className="text-white text-sm">
            <label className="underline cursor-pointer" htmlFor="newCampaignBase">
              Upload the avatar base in <span className="font-bold">.GLB</span> format.
            </label>
            <p>
              <b>Remember:</b> AB file is formed by armature and initial features set.
            </p>
          </div>
        </div>
      </div>
      {ready &&
        <div className="absolute bottom-2 right-2">
          <AGButton nm align="start" onClickEvent={() => {
            swiper.slideNext();
            handleNextStep();
          }}>
            Continue
          </AGButton>
        </div>
      }
    </div>
  )
}