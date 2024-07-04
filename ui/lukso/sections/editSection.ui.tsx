import Image from "next/image"
import { useLayoutEffect, useRef, useState } from "react"
import TransparentBox from "../common/transparentBox.ui"
import { translationInOutBlock } from "../../../utils/gsap/block_in_out.util";
import { FaDownload } from "react-icons/fa6";
import { AiOutlineLoading } from "react-icons/ai";
import { DURATION_ANIMATION_SECTION } from "../../../constants/lukso/animation.constant";
import { IndexFeatureInterface } from "../../../interfaces/api.interface";
import FeatureListUI from "../common/featureList.ui";
import TransparentBoxUI from "../common/transparentBox.ui";

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

  const editAvatarRef = useRef<HTMLDivElement>(null);

  const gsapEnterBlocks = () => {
    if (!editAvatarRef.current) return
    translationInOutBlock(editAvatarRef.current, DURATION_ANIMATION_SECTION);
  }

  const handleExportModel = async () => {
    setIsExportingModel(true);
    await exportModel();
    setIsExportingModel(false);
  }

  useLayoutEffect(() => {
    void gsapEnterBlocks();
  }, [])

  return (
    <section className={`flex h-full items-center justify-between`}>
      {/* Edit Avatar */}
      <div ref={editAvatarRef} className="max-w-[35%] w-[380px] 2xl:w-[461px] h-full -translate-x-full flex flex-col">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-client-primary"
          heightClass="grow"
          borderSizeClass="border-t-0 border-b-0"
        >
          {/* GO BACK BUTTON */}
          <div className="p-2 w-full mb-2 top-[50px]">
            <div onClick={() => onClickBackButton()}>
              <TransparentBoxUI aditionalClass="cursor-pointer" fullWidth border backgroundColorClass="bg-white" heightClass="h-12" paddingClass="p-[0]">
                <div className="flex items-center gap-3">
                  <p className="text-black">Go Back</p>
                </div>
              </TransparentBoxUI>
            </div>
          </div>
          {/* FACE IMAGE */}
          <div className="relative w-[208px] 2xl:w-[347px] h-[208px] 2xl:h-[347px]">
            <Image
              src={picture}
              fill
              alt="lukso avatar selfie view"
              style={{ objectFit: "cover" }}
            />
          </div>
          {features &&
            <FeatureListUI features={features} />
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
          <button className="w-[25%]" onClick={() => void goEditMode()}>
            <TransparentBox fullWidth border backgroundColorClass="bg-white" borderSizeClass="border-r-0">
              <div className="flex items-center gap-3 text-black">
                <>
                  <p className="text-base 2xl:text-lg">Edit</p>
                  <FaDownload />
                </>

              </div>
            </TransparentBox>
          </button>
        </div>
      </div>
    </section>
  )
}