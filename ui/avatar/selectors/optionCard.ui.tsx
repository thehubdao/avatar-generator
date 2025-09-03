import { useEffect, useState } from "react";
import GetImage from "../../../components/commons/getImage.component"
import { FeatureInterface } from "../../../interfaces/api.interface"
import { useAppSelector } from "../../../store/hooks";
import MedalSVG from "../../citizens/common/SVG/medalSVG.ui"
import LockSVG from "../../citizens/common/SVG/lockSVG.ui";

interface OptionCardUIProps {
  option: FeatureInterface,
  isActive?: boolean
}

export default function OptionCardUI({ option, isActive }: OptionCardUIProps) {
  const userXP = useAppSelector(state => state.citizensAuth.xpData);

  const [hasRequiredXP, setHasRequiredXP] = useState<boolean>(false);

  useEffect(() => {
    if (option.requiredXP && userXP) {
      setHasRequiredXP(userXP.xp > option.requiredXP);
    }
  }, [option, userXP]);

  return (
    <div className={`w-[132px] dark:w-[164px] h-[170px] dark:h-[206px] rounded-lg overflow-hidden cursor-pointer`}>
      <div className="relative bg-[#3d3d3d] w-full h-[132px] dark:h-[164px] flex justify-center items-center font-semibold">
        <GetImage url={option.thumb} alt={option.path} />
        {
          option.price != undefined ?
            <>
              <div className="absolute inset-2 flex gap-2">
                <div className="bg-citizens-red w-fit h-fit text-[10px] px-2 py-1 rounded-full">
                  {option.price <= 0 ? 'FREE' : (option.price + ' ' + option.paymentType)}
                </div>
                {!hasRequiredXP && option.requiredXP ?
                  <div className="bg-citizens-yellow w-fit h-fit text-[10px] px-2 py-1 rounded-full text-citizens-dark">
                    {option.requiredXP} XP
                  </div> : null
                }
              </div>
              {!hasRequiredXP && option.requiredXP ?
                <div className="absolute right-2 bottom-2 w-5 h-5 bg-citizens-yellow flex justify-center pt-[2px] rounded-full">
                  <LockSVG />
                </div> : null
              }
            </>
            :
            <>
              <div className="absolute inset-2 bg-citizens-bluedark w-fit h-fit text-xs text-white px-2 py-1 rounded-full">
                {option.balance ? `${option.balance} ${option.balance === 1 ? 'unit' : 'units'}` : 'BASE'}
              </div>
              <div className="absolute right-2 top-2">
                <MedalSVG withCircle={isActive} />
              </div>
            </>
        }
      </div>
      <div className={`relative w-full h-[38px] dark:h-[42px] flex justify-center items-center ${isActive ? 'bg-accent' : 'bg-white'}`}>
        <p className={`font-poppins font-medium text-sm uppercase w-full px-2 text-center truncate ${isActive ? 'text-white' : 'text-gray-normal'}`}>{option.name}</p>
        <div className="absolute bottom-full left-0 w-full flex justify-center">
          <div className="bg-citizens-bluedark px-3 py-1 rounded-t-md text-xs">Artist</div>
        </div>
      </div>
    </div>
  )
}