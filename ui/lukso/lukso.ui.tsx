import EditSectionUI from "./sections/editSection.ui";
import MainSectionUI from "./sections/mainSection.ui";
import MintSectionUI from "./sections/mintSection.ui";
import LoadingUI from "./sections/loadingSection.ui";
import { LuksoSections } from "../../enums/lukso/common.enum";
import { Signer, ethers } from "ethers";
import { ConnectionStatus } from "../../enums/web3";

interface LuksoUIProps {
  isLoading: boolean;
  currentSection: LuksoSections;
  reRoll: () => Promise<void>;
  exportModel: () => Promise<void>;
  setIsEditModeSelected: (value: boolean) => void;
  setCurrentSection: (value: LuksoSections) => void;
  getloaderDivElement: (elementReference: HTMLDivElement) => void;
  handleClaim: (address: string, signer: Signer) => Promise<{ message: string, success: boolean }>;
  onConnect: (signer: Signer | undefined, status: ConnectionStatus) => void
  hasMinted: boolean
  signer: Signer | undefined
  etherProvider: ethers.BrowserProvider | undefined
  isGettingInfoAboutHasMinted: boolean
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
  signer,
  onConnect,
  etherProvider,
  isGettingInfoAboutHasMinted
}: LuksoUIProps) {


  return (
    <div className="w-full grow text-white text-center">
      {isLoading && <LoadingUI getloaderDivElement={getloaderDivElement} />}
      {(currentSection === LuksoSections.Main) && <MainSectionUI onConnect={onConnect} setCurrentSection={(newSection) => setCurrentSection(newSection)} hasMinted={hasMinted} signer={signer} etherProvider={etherProvider} isGettingInfoAboutHasMinted={isGettingInfoAboutHasMinted}/>}
      {(currentSection === LuksoSections.Mint) && <MintSectionUI onConnect={onConnect} setCurrentSection={(newSection) => setCurrentSection(newSection)} reRoll={reRoll} handleClaim={handleClaim} signer={signer} />}
      {(currentSection === LuksoSections.Edit) && <EditSectionUI setIsEditModeSelected={setIsEditModeSelected} exportModel={exportModel} />}
    </div>
  )
}