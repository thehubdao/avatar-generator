import EditLuksoSectionUI from "./sections/editSection.ui";
import MainLuksoSectionUI from "./sections/mainSection.ui";
import MintLuksoSectionUI from "./sections/mintSection.ui";
import LuksoLoadingUI from "./sections/loadingSection.ui";
import { FaXTwitter, FaDiscord, FaInstagram } from "react-icons/fa6";

interface LuksoUIProps {
  reRoll: () => Promise<void>;
  setIsEditModeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  currentSection: number;
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>;
  getloaderDivElement: (elementReference: HTMLDivElement) => void;
}

export default function LuksoUI({ reRoll, setIsEditModeSelected, isLoading, currentSection, setCurrentSection, getloaderDivElement }: LuksoUIProps) {
  const luksoSocialMedia = [{
    alt: 'twitter icon',
    link: 'https://twitter.com/lukso_io',
    icon: <FaXTwitter size={25} />
  }, {
    alt: 'discord icon',
    link: 'https://discord.com/invite/lukso',
    icon: <FaInstagram size={25} />
  }, {
    alt: 'instagram icon',
    link: 'https://www.instagram.com/lukso/',
    icon: <FaDiscord size={25} />
  }]

  return (
    <div className="w-full grow text-white text-center">
      <LuksoLoadingUI loading={isLoading} socialMedia={luksoSocialMedia} getloaderDivElement={getloaderDivElement} />
      {(currentSection === 0) && <MainLuksoSectionUI setCurrentSection={setCurrentSection} />}
      {(currentSection === 1) && <MintLuksoSectionUI setCurrentSection={setCurrentSection} socialMedia={luksoSocialMedia} reRoll={reRoll} />}
      {(currentSection === 2) && <EditLuksoSectionUI setIsEditModeSelected={setIsEditModeSelected} />}
    </div>
  )
}