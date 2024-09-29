import Button from "./button.ui";
import PlusSVG from "./SVG/plusSVG.ui";

export default function Notifications() {
  return (
    <div className="fixed bottom-8 right-4">
      <Button label="/// Notifications" handleClick={() => { }} withIcon className="w-[376px]" textStiles="text-start pl-2">
        <PlusSVG />
      </Button>
    </div>
  )
}