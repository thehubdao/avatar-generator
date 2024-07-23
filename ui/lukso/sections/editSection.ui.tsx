import Image from "next/image";
import { useRef, useState } from "react";
import TransparentBox from "../common/transparentBox.ui";
import { FaDownload } from "react-icons/fa6";
import { BsFillBackpackFill } from "react-icons/bs";
import { AiOutlineLoading } from "react-icons/ai";
import { IndexFeatureInterface } from "../../../interfaces/api.interface";
import FeatureListUI from "../common/featureList.ui";
import TransparentBoxUI from "../common/transparentBox.ui";
import LogoUI from "../common/logo.ui";
import Toastify from "toastify-js";

interface EditSectionUIProps {
  exportModel: () => Promise<void>;
  setIsEditModeSelected: (value: boolean) => void;
  features?: IndexFeatureInterface[];
  combination: string;
  picture: string;
  onClickBackButton: () => void
  goEditMode: () => void
}

export default function EditSectionUI({ goEditMode, onClickBackButton, exportModel, features, picture }: EditSectionUIProps) {
  const [isExportingModel, setIsExportingModel] = useState<boolean>(false);
  const [shouldReveal, setShouldReveal] = useState(false);

  const downloadNotification = Toastify({
    text: "Your Citizen is being downloaded, please wait.",
    gravity: "bottom", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    duration: 0,
    className: "!text-[#C25399]",
    style: {
      background: "#FFD9EF",
    },
  })

  const editAvatarRef = useRef<HTMLDivElement>(null);

  const handleExportModel = async () => {
    setIsExportingModel(true);
    downloadNotification.showToast()
    await exportModel();
    downloadNotification.hideToast()
    setIsExportingModel(false);
  }

  return (
    <div className={`flex h-full items-center justify-between`}>
      {/* Edit Avatar */}
      <div ref={editAvatarRef} className="max-w-[35%] w-[380px] 2xl:w-[461px] h-full flex flex-col z-0">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-client-primary"
          heightClass="grow"
          borderSizeClass="border-t-0 border-b-0"
          justifyClass="justify-beetwen"
        >
          {/* GO BACK BUTTON */}
          <div className="px-2 py-[5vh] w-full">
            <div onClick={() => onClickBackButton()}>
              <TransparentBoxUI aditionalClass="cursor-pointer" fullWidth border backgroundColorClass="bg-white" heightClass="h-12" paddingClass="p-[0]">
                <div className="flex items-center gap-3">
                  <p className="text-black">My Citizens</p>
                </div>
              </TransparentBoxUI>
            </div>
          </div>
          {/* FACE IMAGE */}
          <div className="relative w-[208px] 2xl:w-[347px] h-[208px] 2xl:h-[347px] bg-white/25 overflow-hidden">
            <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <LogoUI />
            </div>
            {picture != '' && <Image
              src={picture}
              fill
              style={{ objectFit: "cover" }}
              className={`opacity-0 ${shouldReveal ? 'scale-100 opacity-100' : 'scale-125'} transition-all duration-1000 ease-out`}
              onLoadingComplete={() => {

                setShouldReveal(true)
              }} alt={""} />}
          </div>
          {features ?
            <FeatureListUI features={features} />
            :
            <div className="scale-50">
              <LogoUI />
            </div>
          }
        </TransparentBox>
        <div className="h-14 w-full 2xl:h-18 flex whitespace-nowrap">
          <button className="w-[75%]" onClick={() => void handleExportModel()}>
            <TransparentBox fullWidth border backgroundColorClass="bg-white" borderSizeClass="border-r-0">
              <div className="flex items-center gap-3 text-black">
                {isExportingModel ?
                  <>
                    <p className="text-base 2xl:text-lg">Downloading</p>
                    <AiOutlineLoading className="animate-spin" />
                  </>
                  :
                  <>
                    <p className="text-base 2xl:text-lg">Download</p>
                    <FaDownload />
                  </>
                }
              </div>
            </TransparentBox>
          </button>
          <button className="w-[50%]" onClick={() => void goEditMode()}>
            <TransparentBox fullWidth border backgroundColorClass="bg-white" borderSizeClass="border-r-0">
              <div className="flex items-center gap-3 text-black">
                <>
                  <p className="text-base 2xl:text-lg">My Wardrobe</p>
                  <BsFillBackpackFill/>
                  
                </>

              </div>
            </TransparentBox>
          </button>
        </div>
      </div>
    </div>
  )
}