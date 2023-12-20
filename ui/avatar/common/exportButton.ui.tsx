import { AiOutlineCloudDownload } from "react-icons/ai";
import AGButton from "../../common/ag-button.component";
import { ModelExtension } from "../../../enums/export.enum";
import { useState } from "react";
import { Delay } from "../../../utils/common.util";
import { AiOutlineLoading } from "react-icons/ai";

interface ExportButtonUIProps {
  children?: string | JSX.Element;
  onClickEvent: (type: ModelExtension) => Promise<void>;
  allowExtension?: ModelExtension[];
}

export default function ExportButtonUI({ children, onClickEvent, allowExtension }: ExportButtonUIProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const buttonClickHandler = () => {
    setIsOpen(!isOpen);
  }

  const optionClickHandler = async (type: ModelExtension) => {
    setIsExporting(true);
    setIsOpen(false);
    await onClickEvent(type);
    await Delay(500);
    setIsExporting(false);
  }
  
  return (
    <div className="relative">
      <AGButton full onClickEvent={() => buttonClickHandler()}>
        <>
          <div className={`absolute w-fit h-fit inset-x-1/2 inset-y-1/2 -translate-x-1/2 -translate-y-1/2 ${isExporting ? '' : 'invisible'}`}>
            <AiOutlineLoading  className="animate-spin"/>
          </div>

          <div className={`${isExporting ? 'invisible' : ''}`}>
            {
              children
            }
          </div>
        </>
      </AGButton>
      {
        isOpen &&
        <div className="absolute w-full top-full rounded px-4 py-2 bg-bg">
          {
            allowExtension != undefined && allowExtension.length > 0 ?
            allowExtension.map(ext => {
              return (
                <AGButton key={ext} full onClickEvent={() => optionClickHandler(ext)}>
                  <div className="flex items-center gap-4">
                    <AiOutlineCloudDownload />
                    <p className="uppercase">{ext}</p>
                  </div>
                </AGButton>
              )
            }) :
              <AGButton key={ModelExtension.GLB} full onClickEvent={() => optionClickHandler(ModelExtension.GLB)}>
                <div className="flex items-center gap-4">
                  <AiOutlineCloudDownload />
                  <p className="uppercase">{ModelExtension.GLB}</p>
                </div>
              </AGButton>
          }
        </div>
      }
    </div>
  )
}