import EditSectionUI from "./sections/editSection.ui";
import MainSectionUI from "./sections/mainSection.ui";
import MintSectionUI from "./sections/mintSection.ui";
import LoadingUI from "./sections/loadingSection.ui";
import { LuksoSections } from "../../enums/lukso/common.enum";
import { BrowserProvider, ethers } from "ethers";
import { IndexFeatureInterface } from "../../interfaces/api.interface";
import LoginUI from "./sections/loginSection.ui";
import ConnectModalUI from "./common/conectModal";
import ViewSectionUI from "./sections/viewSection.ui";

interface LuksoUIProps {
  isLoading: boolean;
  currentSection: LuksoSections;
  exportModel: () => Promise<void>;
  setIsEditModeSelected: (value: boolean) => void;
  setCurrentSection: (value: LuksoSections) => void;
  getloaderDivElement: (elementReference: HTMLDivElement) => void;
  hasMinted: boolean;
  provider: ethers.BrowserProvider | undefined;
  isGettingInfoAboutHasMinted: boolean;
  features?: IndexFeatureInterface[];
  picture: string;
  combination: string;
  combinationPictureUrl: string;
}

export default function LuksoUI({
  setIsEditModeSelected,
  isLoading,
  currentSection,
  setCurrentSection,
  getloaderDivElement,
  exportModel,
  features,
  picture,
  combination,
  combinationPictureUrl
}: LuksoUIProps) {
  return (
    <div className="w-full grow text-white text-center">
      {isLoading && <LoadingUI getloaderDivElement={getloaderDivElement} />}
      {(currentSection === LuksoSections.View) && <ViewSectionUI combinationPictureUrl={combinationPictureUrl} combination={combination} picture={picture} features={features} setCurrentSection={(newSection) => setCurrentSection(newSection)} />}
      {(currentSection === LuksoSections.Edit) && <EditSectionUI picture={picture} combination={combination} features={features} setIsEditModeSelected={setIsEditModeSelected} exportModel={exportModel} />}
    </div>
  )
}