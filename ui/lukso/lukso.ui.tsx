import EditLuksoSectionUI from "./sections/editSection.ui";
import MainLuksoSectionUI from "./sections/mainSection.ui";
import MintLuksoSectionUI from "./sections/mintSection.ui";

export default function LuksoUI() {
  return (
    <div className="w-full grow text-white text-center">
      <MainLuksoSectionUI hidden/>
      <MintLuksoSectionUI hidden />
      <EditLuksoSectionUI  />
    </div>
  )
}