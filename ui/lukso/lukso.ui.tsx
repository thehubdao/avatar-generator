import { useEffect, useState } from "react";
import EditLuksoSectionUI from "./sections/editSection.ui";
import MainLuksoSectionUI from "./sections/mainSection.ui";
import MintLuksoSectionUI from "./sections/mintSection.ui";
import LuksoLoadingUI from "./sections/loadingSection.ui";
import { FaXTwitter, FaDiscord, FaInstagram } from "react-icons/fa6";


export default function LuksoUI() {
  const [currentSection, setCurrentSection] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      <LuksoLoadingUI loading={isLoading} setIsLoading={setIsLoading} setCurrentSection={setCurrentSection} socialMedia={luksoSocialMedia} />
      {(currentSection === 0) && <MainLuksoSectionUI setCurrentSection={setCurrentSection} />}
      {(currentSection === 1) && <MintLuksoSectionUI setCurrentSection={setCurrentSection} socialMedia={luksoSocialMedia} />}
      {(currentSection === 2) && <EditLuksoSectionUI />}
    </div>
  )
}