import EditLuksoSectionUI from "./sections/editSection.ui";
import MainLuksoSectionUI from "./sections/mainSection.ui";
import MintLuksoSectionUI from "./sections/mintSection.ui";
import LuksoLoadingUI from "./sections/loadingSection.ui";

interface LuksoUIProps {
  reRoll: () => Promise<void>;
  setIsEditModeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  currentSection: number;
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>;
  getloaderDivElement: (elementReference: HTMLDivElement) => void;
}

export default function LuksoUI({ reRoll, setIsEditModeSelected, isLoading, currentSection, setCurrentSection, getloaderDivElement }: LuksoUIProps) {
  return (
    <div className="w-full grow text-white text-center">
      <LuksoLoadingUI loading={isLoading} getloaderDivElement={getloaderDivElement} />
      {(currentSection === 0) && <MainLuksoSectionUI setCurrentSection={setCurrentSection} />}
      {(currentSection === 1) && <MintLuksoSectionUI setCurrentSection={setCurrentSection} reRoll={reRoll} />}
      {(currentSection === 2) && <EditLuksoSectionUI setIsEditModeSelected={setIsEditModeSelected} />}
    </div>
  )
}