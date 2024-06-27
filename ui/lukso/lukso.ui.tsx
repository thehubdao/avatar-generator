import EditSectionUI from "./sections/editSection.ui";
import LoadingUI from "./sections/loadingSection.ui";
import { LuksoSections } from "../../enums/lukso/common.enum";
import { ethers } from "ethers";
import { IndexFeatureInterface } from "../../interfaces/api.interface";
import ViewSectionUI from "./sections/viewSection.ui";

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
  goEditMode: ()=>void
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
      {(currentSection === LuksoSections.View) && <ViewSectionUI onClickBackButton={onClickBackButton} combinationPictureUrl={combinationPictureUrl} combination={combination} features={features} />}
      {(currentSection === LuksoSections.Edit) && <EditSectionUI picture={combinationPictureUrl} combination={combination} features={features} setIsEditModeSelected={setIsEditModeSelected} exportModel={exportModel} onClickBackButton={onClickBackButton} 
      goEditMode={goEditMode} />}
    </div>
  )
}