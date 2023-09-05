import EditLuksoSectionUI from "./sections/editSection";
import MainLuksoSectionUI from "./sections/mainSection.ui";
import MintLuksoSectionUI from "./sections/mintSection.ui";

export default function LuksoUI() {
  return (
    <div className="w-full grow">
      <MainLuksoSectionUI />
      <MintLuksoSectionUI />
      <EditLuksoSectionUI />
    </div>
  )
}