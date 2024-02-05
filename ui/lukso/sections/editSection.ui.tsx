import Image from "next/image"
import { Fragment, useLayoutEffect, useRef, useState } from "react"
import TransparentBox from "../common/transparentBox.ui"
import { translationInOutBlock } from "../../../utils/gsap/block_in_out.util";
import { FaDownload } from "react-icons/fa6";
import { AiOutlineLoading } from "react-icons/ai";
import { DURATION_ANIMATION_SECTION } from "../../../constants/lukso/animation.constant";
import { IndexFeatureInterface } from "../../../interfaces/api.interface";
import FeatureListUI from "../common/featureList.ui";

interface EditSectionUIProps {
  exportModel: () => Promise<void>;
  setIsEditModeSelected: (value: boolean) => void;
  features?: IndexFeatureInterface[];
  combination:string;
}

export default function EditSectionUI({combination, exportModel, features }: EditSectionUIProps) {
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
      <div ref={editAvatarRef} className="w-[380px] 2xl:w-[461px] h-full -translate-x-full flex flex-col">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
          borderSizeClass="border-t-0 border-b-0"
        >
          <div className="relative w-[208px] 2xl:w-[347px] h-[180px] 2xl:h-[301px]">
            <Image
              src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${process.env.NEXT_PUBLIC_IPFS_IMAGE_URL}/${combination}.png`}
              fill
              alt="lukso avatar selfie view"
            />
          </div>
          {features && 
            <FeatureListUI features={features} />
          }
        </TransparentBox>
        <div className="h-14 w-full 2xl:h-18 flex whitespace-nowrap">
          <button className="w-full" onClick={() => void handleExportModel()}>
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
        </div>
      </div>
    </section>
  )
}