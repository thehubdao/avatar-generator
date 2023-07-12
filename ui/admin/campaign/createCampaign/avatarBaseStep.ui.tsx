import { IoAlert } from "react-icons/io5";
import AGButton from "../../../common/ag-button.component";
import { useSwiper } from "swiper/react";
import { useAppDispatch } from "../../../../store/hooks";
import { useRef } from "react";
import { setSkin } from "../../../../store/addCampaignSlice";

interface AvatarBaseStepUIProps {
  ready: boolean;
  handleNextStep: () => void;
}

export default function AvatarBaseStepUI({ ready = false, handleNextStep }: AvatarBaseStepUIProps) {
  const dispatch = useAppDispatch();
  const skinMaterial = useRef<string>('');
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
        <div className="mt-5 w-full">
          <p>Do your <span className="font-bold text-purple">AB</span> has a interchangeable skin color material?</p>
          <input type="text" defaultValue={''} className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg bg-bg" onChange={e => {
            skinMaterial.current = e.currentTarget.value
          }} />
          <p className="text-xs">If the answer is <span className="font-bold text-purple">YES</span>, put the name of the skin material as it is called in the 3D file, otherwise leave the field empty.</p>
        </div>
      </div>

      {ready &&
        <div className="absolute bottom-2 right-2">
          <AGButton nm align="start" onClickEvent={() => {
            if(skinMaterial.current.length > 0) dispatch(setSkin({materialName: skinMaterial.current}))
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