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
  handleClaim: (address: string, provider: BrowserProvider) => Promise<{ message: string, success: boolean }>;
  hasMinted: boolean;
  provider: ethers.BrowserProvider | undefined;
  isGettingInfoAboutHasMinted: boolean;
  features?: IndexFeatureInterface[];
  picture:string;
  combination:string;
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
  combination
}: LuksoUIProps) {

  return (
    <div className="w-full grow text-white text-center">
      <MintSectionUI picture={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${process.env.NEXT_PUBLIC_IPFS_IMAGE_URL}/${combination}.png`} features={features} setCurrentSection={(newSection) => setCurrentSection(newSection)} reRoll={reRoll} handleClaim={handleClaim} provider={provider} />
    </div>
  )

  return (
    <div className="w-full grow text-white text-center">
      {isLoading && <LoadingUI getloaderDivElement={getloaderDivElement} />}
      {(currentSection === LuksoSections.Main) && <MainSectionUI combination={combination} picture={picture} setCurrentSection={(newSection) => setCurrentSection(newSection)} hasMinted={hasMinted} provider={provider} isGettingInfoAboutHasMinted={isGettingInfoAboutHasMinted}/>}
      {(currentSection === LuksoSections.Mint) && <MintSectionUI picture={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${process.env.NEXT_PUBLIC_IPFS_IMAGE_URL}/${combination}.png`} features={features} setCurrentSection={(newSection) => setCurrentSection(newSection)} reRoll={reRoll} handleClaim={handleClaim} provider={provider} />}
      {(currentSection === LuksoSections.Edit) && <EditSectionUI combination={combination} features={features} setIsEditModeSelected={setIsEditModeSelected} exportModel={exportModel} />}
    </div>
  )
}