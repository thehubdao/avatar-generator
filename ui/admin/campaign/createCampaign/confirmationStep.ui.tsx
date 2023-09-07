import { IoAlert } from "react-icons/io5";
import AGButton from "../../../common/ag-button.component";
import Link from "next/link";
import { useSwiper } from "swiper/react";
import { IoMdArrowBack } from "react-icons/io";
import { AiOutlineLoading } from "react-icons/ai";
import { useAppSelector } from "../../../../store/hooks";
import { PageLocation } from "../../../../enums/common.enum";
import { ExternalLink } from "../../../../enums/external-links.enum";

interface ConfirmationStepUIProps {
  handleNextStep: () => Promise<void>;
}

export default function ConfirmationStepUI({ handleNextStep }: ConfirmationStepUIProps) {
  const swiper = useSwiper();
  const isLoading = useAppSelector(state => state.addCampaign.isLoading);

  return (
    <div className="flex flex-col justify-between px-5">
      {!isLoading ?
        <>
          <div className="pb-20">
            <h2 className="text-2xl text-purple font-poppins font-semibold">IS EVERYTHING ALL RIGHT?</h2>
            <p>Review the <span className="font-bold">CAMPAIGN</span> in the viewer!</p>
            <div className="relative bg-purple p-5 rounded-r-2xl rounded-bl-lg rounded-t- mt-5 flex gap-5">
              <div className="absolute top-0 -left-3 border-8 border-l-transparent border-b-transparent border-purple"></div>
              <div className="w-10 h-10 text-4xl text-purple bg-white rounded-full flex justify-center items-center">
                <IoAlert />
              </div>
              <div className="text-white text-sm">
                <p>
                  Something is wrong? back to check the first steps.
                </p>
                <p>
                  <b>Remember: </b> you can&nbsp;
                  <Link href={ExternalLink.Documentation} target="_blank" className="underline cursor-pointer font-bold">
                    visit the docs.
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex">
            <AGButton nm fit align="start" onClickEvent={() => {
              swiper.slidePrev();
            }}>
              <IoMdArrowBack />
            </AGButton>
            <AGButton nm onClickEvent={() => handleNextStep()}>
              Create
            </AGButton>
          </div>
        </>
        :
        <>
          <div className="pb-20">
            <h2 className="text-2xl text-purple font-poppins font-semibold">THE CAMPAIGN IS BUILDING!</h2>
            <p>It could take a few minutes...</p>
            <div className="relative bg-purple p-5 rounded-r-2xl rounded-bl-lg rounded-t- mt-5 flex gap-5">
              <div className="absolute top-0 -left-3 border-8 border-l-transparent border-b-transparent border-purple"></div>
              <div className="w-10 h-10 text-4xl text-purple bg-white rounded-full flex justify-center items-center">
                <IoAlert />
              </div>
              <div className="text-white text-sm">
                <p>
                  takes too long? back to&nbsp;
                  <Link href={PageLocation.Admin} className="underline cursor-pointer font-bold" >home</Link>
                  &nbsp;and try later.
                </p>
                <p>
                  <b>Remember: </b> you can&nbsp;
                  <Link href={ExternalLink.Documentation} target="_blank" className="underline cursor-pointer font-bold">
                    visit the docs.
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex">
            <AGButton nm align="center">
              <div className="flex justify-center text-purple">
                <AiOutlineLoading className="animate-spin" />
              </div>
            </AGButton>
          </div>
        </>
      }
    </div >
  )
}