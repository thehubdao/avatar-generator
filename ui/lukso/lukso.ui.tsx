import { useState } from "react";
import EditLuksoSectionUI from "./sections/editSection.ui";
import MainLuksoSectionUI from "./sections/mainSection.ui";
import MintLuksoSectionUI from "./sections/mintSection.ui";
import LuksoLoadingUI from "./sections/loadingSection.ui";

export default function LuksoUI() {
  const [currentSection, setCurrentSection] = useState<number>(0);

  return (
    <div className="w-full grow text-white text-center">
      <LuksoLoadingUI loading={false} />
      {(currentSection === 0) && <MainLuksoSectionUI setCurrentSection={setCurrentSection} />}
      {(currentSection === 1) && <MintLuksoSectionUI setCurrentSection={setCurrentSection} />}
      {(currentSection === 2) && <EditLuksoSectionUI />}
    </div>
  )
}