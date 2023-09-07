import { useEffect, useState } from "react";
import EditLuksoSectionUI from "./sections/editSection.ui";
import MainLuksoSectionUI from "./sections/mainSection.ui";
import MintLuksoSectionUI from "./sections/mintSection.ui";
import LuksoLoadingUI from "./sections/loadingSection.ui";

export default function LuksoUI() {
  const [currentSection, setCurrentSection] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setCurrentSection(0);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="w-full grow text-white text-center">
      <LuksoLoadingUI loading={isLoading} bgColor="FABCE2" />
      {(currentSection === 0) && <MainLuksoSectionUI setCurrentSection={setCurrentSection} />}
      {(currentSection === 1) && <MintLuksoSectionUI setCurrentSection={setCurrentSection} />}
      {(currentSection === 2) && <EditLuksoSectionUI />}
    </div>
  )
}