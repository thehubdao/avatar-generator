import { useRef, useState } from "react";
import Button from "./button.ui";
import ArrowSVG from "./SVG/arrowSVG.ui";
import { useOnClickOutside } from "usehooks-ts";

interface SelectorUIProps {
  list?: string[];
  label?: string;
  selection?: string;
  selectionHandler: (value?: string) => void;
}

export default function SelectorUI({ list, selection, label = 'CHOOSE', selectionHandler }: SelectorUIProps) {
  const menuDOM = useRef<HTMLDivElement>(null);
  
  const [isButtonHovered, setIsButtonHovered] = useState<boolean>(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

  function handleClickOutside() {
    if (!isButtonHovered) setIsSelectorOpen(false);
  }

  useOnClickOutside(menuDOM, handleClickOutside);

  return (
    <div ref={menuDOM} className="relative">
      <div onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}>
        <Button label={label} handleClick={() => setIsSelectorOpen(!isSelectorOpen)} withIcon textStiles="px-4">
          <div className={`${isSelectorOpen ? 'rotate-180' : ''}`}>
            <ArrowSVG className="fill-white" />
          </div>
        </Button>
      </div>

      <p className="absolute top-full right-0 px-2 mt-1 text-xs text-white/20">{selection}</p>
      {isSelectorOpen &&
        <div className="absolute top-full w-full max-h-96 overflow-y-auto rounded-2xl bg-white mt-2 z-10">
          {
            list?.map((el, index) => (
              <div key={index} className="py-2 px-4 cursor-pointer hover:bg-citizens-gray" onClick={() => {
                selectionHandler(el);
                setIsSelectorOpen(false);
              }}>
                <p className="text-center text-sm truncate">{el}</p>
              </div>
            ))
          }
          {/* <div className="py-2 px-4 cursor-pointer hover:bg-citizens-gray" onClick={() => {
            selectionHandler();
            setIsSelectorOpen(false);
          }}>
            <p className="text-center text-sm truncate">All</p>
          </div> */}
        </div>
      }
    </div>
  )
}