import { useRef, useState } from "react";
import Button from "./button.ui";
import ArrowSVG from "./SVG/arrowSVG.ui";
import { useOnClickOutside } from "usehooks-ts";
import { CAMPAIGN_LABELS } from "../../../constants/labels.constant";

interface SelectorUIProps {
  list?: string[];
  areCampaigns?: boolean;
  label?: string;
  selection?: string;
  dropDownPosition?: string;
  selectionHandler: (value?: string) => void;
}

export default function SelectorUI({ list, areCampaigns, selection, label = 'CHOOSE', dropDownPosition,  selectionHandler }: SelectorUIProps) {
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
        <Button label={label} className="min-w-fit md:min-w-[214px]" handleClick={() => setIsSelectorOpen(!isSelectorOpen)} withIcon textStyles="sm:px-4 text-xs sm:text-lg" iconStyles={'w-[23px] sm:w-10 h-[16px] sm:h-[27px]'} >
          <div className={`scale-75 sm:scale-100 ${isSelectorOpen ? 'rotate-180' : ''}`}>
            <ArrowSVG className="fill-white" />
          </div>
        </Button>
      </div>
      <p className="absolute top-full left-0 sm:left-auto sm:right-0 px-2 sm:mt-1 text-xs text-white/20">{areCampaigns ? CAMPAIGN_LABELS[selection?.toLowerCase() as keyof typeof CAMPAIGN_LABELS]?.dropdownName : selection}</p>
      {isSelectorOpen &&
        <div className={`absolute top-full ${dropDownPosition} w-48 md:w-full max-h-96 overflow-y-auto rounded-2xl bg-white mt-2 z-10`}>
          {
            list?.map((el, index) => (
              <div key={index} className="py-2 px-4 cursor-pointer hover:bg-citizens-gray" onClick={() => {
                selectionHandler(el);
                setIsSelectorOpen(false);
              }}>
                <p className="text-center text-sm truncate">{areCampaigns ? CAMPAIGN_LABELS[el.toLowerCase() as keyof typeof CAMPAIGN_LABELS]?.dropdownName : el}</p>
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