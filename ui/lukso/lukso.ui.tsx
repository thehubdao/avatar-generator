import EditSectionUI from "./sections/editSection.ui";
import LoadingUI from "./sections/loadingSection.ui";
import { LuksoSections } from "../../enums/lukso/common.enum";
import { ethers } from "ethers";
import { IndexFeatureInterface } from "../../interfaces/api.interface";

interface LuksoUIProps {
  isLoading: boolean;
  currentSection: LuksoSections;
  exportModel: () => Promise<void>;
  setIsEditModeSelected: (value: boolean) => void;
  getloaderDivElement: (elementReference: HTMLDivElement) => void;
  provider: ethers.BrowserProvider | undefined;
  features?: IndexFeatureInterface[];
  combination: string;
  combinationPictureUrl: string;
  onClickBackButton: () => void
  goEditMode: () => void
}

export default function LuksoUI({
  setIsEditModeSelected,
  isLoading,
  currentSection,
  getloaderDivElement,
  exportModel,
  features,
  combination,
  combinationPictureUrl,
  onClickBackButton,
  goEditMode
}: LuksoUIProps) {
  return (
    <div className="w-full grow text-white text-center">
      {isLoading && <LoadingUI getloaderDivElement={getloaderDivElement} />}
      {(currentSection === LuksoSections.Edit) && <EditSectionUI onClickBackButton={onClickBackButton} picture={combinationPictureUrl} combination={combination} features={features} setIsEditModeSelected={setIsEditModeSelected} exportModel={exportModel}
        goEditMode={goEditMode} />}
    </div>
  )
}