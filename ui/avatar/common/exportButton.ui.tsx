import { AiOutlineCloudDownload } from "react-icons/ai";
import AGButton from "../../common/ag-button.component";
import { ModelExtension } from "../../../enums/export.enum";

interface ExportButtonUIProps {
  children?: string | JSX.Element;
  onClickEvent: (type: ModelExtension) => Promise<void>;
}

export default function ExportButtonUI({ children, onClickEvent }: ExportButtonUIProps) {
  return (
    <div className="relative">
      <AGButton full>
        {children}
      </AGButton>
      <div className="absolute w-full top-full rounded px-4 py-2 bg-bg">
        <AGButton full onClickEvent={() => onClickEvent(ModelExtension.VRM)}>
          <div className="flex items-center gap-4">
            <AiOutlineCloudDownload />
            <p>VRM</p>
          </div>
        </AGButton>

        <AGButton full onClickEvent={() => onClickEvent(ModelExtension.GLB)}>
          <div className="flex items-center gap-4">
            <AiOutlineCloudDownload />
            <p>GLB</p>
          </div>
        </AGButton>
      </div>
    </div>
  )
}