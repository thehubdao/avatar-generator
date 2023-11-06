import EditLuksoSectionUI from "./sections/editSection.ui";
import MainLuksoSectionUI from "./sections/mainSection.ui";
import MintLuksoSectionUI from "./sections/mintSection.ui";
import LuksoLoadingUI from "./sections/loadingSection.ui";

interface LuksoUIProps {
  reRoll: () => void | Promise<void>;
  setIsEditModeSelected: (value: boolean) => void;
  isLoading: boolean;
  currentSection: number;
  setCurrentSection: (value: number) => void;
  getloaderDivElement: (elementReference: HTMLDivElement) => void;
  exportModel: () => void | Promise<void>;
}

export default function LuksoUI({ reRoll, setIsEditModeSelected, isLoading, currentSection, setCurrentSection, getloaderDivElement, exportModel }: LuksoUIProps) {
  return (
    <div className="w-full grow text-white text-center">
      <LuksoLoadingUI loading={isLoading} getloaderDivElement={getloaderDivElement} />
      {(currentSection === 0) && <MainLuksoSectionUI setCurrentSection={(newSection: number) => setCurrentSection(newSection)} />}
      {(currentSection === 1) && <MintLuksoSectionUI setCurrentSection={(newSection: number) => setCurrentSection(newSection)} reRoll={reRoll} />}
      {(currentSection === 2) && <EditLuksoSectionUI setIsEditModeSelected={setIsEditModeSelected} exportModel={exportModel}/>}
    </div>
  )
}