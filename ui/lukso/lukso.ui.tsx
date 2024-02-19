import EditSectionUI from "./sections/editSection.ui";
import MainSectionUI from "./sections/mainSection.ui";
import MintSectionUI from "./sections/mintSection.ui";
import LoadingUI from "./sections/loadingSection.ui";
import { LuksoSections } from "../../enums/lukso/common.enum";
import { BrowserProvider, ethers } from "ethers";
import { IndexFeatureInterface } from "../../interfaces/api.interface";

interface LuksoUIProps {
  isLoading: boolean;
  currentSection: LuksoSections;
  reRoll: () => Promise<void>;
  exportModel: () => Promise<void>;
  setIsEditModeSelected: (value: boolean) => void;
  setCurrentSection: (value: LuksoSections) => void;
  getloaderDivElement: (elementReference: HTMLDivElement) => void;
  handleClaim: (address: string, provider: BrowserProvider) => Promise<{ message: string, success: boolean, tokenId?:string }>;
  hasMinted: boolean;
  provider: ethers.BrowserProvider | undefined;
  isGettingInfoAboutHasMinted: boolean;
  features?: IndexFeatureInterface[];
  picture:string;
  combination:string;
  hasSupplyReached:boolean;
}

export default function LuksoUI({
  reRoll,
  setIsEditModeSelected,
  isLoading,
  currentSection,
  setCurrentSection,
  getloaderDivElement,
  exportModel,
  handleClaim,
  hasMinted,
  provider,
  isGettingInfoAboutHasMinted,
  features,
  picture,
  combination, 
  hasSupplyReached
}: LuksoUIProps) {
  return (
    <div className="w-full grow text-white text-center">
      {isLoading && <LoadingUI getloaderDivElement={getloaderDivElement} />}
      {(currentSection === LuksoSections.Main) && <MainSectionUI hasSupplyReached={hasSupplyReached} combination={combination} picture={picture} setCurrentSection={(newSection) => setCurrentSection(newSection)} hasMinted={hasMinted} provider={provider} isGettingInfoAboutHasMinted={isGettingInfoAboutHasMinted}/>}
      {(currentSection === LuksoSections.Mint) && <MintSectionUI combination = {combination} picture={picture} features={features} setCurrentSection={(newSection) => setCurrentSection(newSection)} reRoll={reRoll} handleClaim={handleClaim} provider={provider} />}
      {(currentSection === LuksoSections.Edit) && <EditSectionUI picture={picture} combination={combination} features={features} setIsEditModeSelected={setIsEditModeSelected} exportModel={exportModel} />}
    </div>
  )
}