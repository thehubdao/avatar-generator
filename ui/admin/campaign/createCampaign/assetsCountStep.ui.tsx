import { IoAlert } from "react-icons/io5";
import AGButton from "../../../common/ag-button.component";
import { useSwiper } from "swiper/react";
import { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";

interface AssetsCountStepUIProps {
  ready: boolean;
  handleNextStep: (value: number) => void;
  handleBackStep: () => void;
}

export default function AssetsCountStepUI({ ready = false, handleNextStep, handleBackStep }: AssetsCountStepUIProps) {
  const swiper = useSwiper();
  const [featuresCount, setFeaturesCount] = useState<number>(1);
  return (
    <div className="flex flex-col justify-between px-5">
      <div className="pb-20">
        <h2 className="text-2xl text-orange font-poppins font-bold">FEATURES</h2>
        <p>The <span className="text-orange font-bold">FEATURES</span> are interchangeable parts of the avatar.</p>
        <div className="relative bg-orange p-5 rounded-r-2xl rounded-bl-lg rounded-t- mt-5 flex gap-5">
          <div className="absolute top-0 -left-3 border-8 border-l-transparent border-b-transparent border-orange"></div>
          <div className="w-10 h-10 text-4xl text-orange bg-white rounded-full flex justify-center items-center">
            <IoAlert />
          </div>
          <div className="text-white text-sm">
            <p>
              <b>Remember:</b> The features have some configurable options, please set up every feature before to finish.
            </p>
          </div>
        </div>
        <div className="w-full flex items-center justify-between pt-4">
          <p>How many features have your avatar?</p>
          <input type="number" defaultValue={1} className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" onChange={e => {
            setFeaturesCount(parseInt(e.target.value))
          }} />
        </div>
      </div>
      {ready &&
        <div className="absolute bottom-2 right-2 flex">
          <AGButton nm fit align="start" onClickEvent={() => {
            handleBackStep();
            swiper.slidePrev();
          }}>
            <IoMdArrowBack />
          </AGButton>
          <AGButton nm align="start" onClickEvent={() => {
            swiper.slideNext();
            handleNextStep(featuresCount);
          }}>
            Continue
          </AGButton>
        </div>
      }
    </div>
  )
}