import { useEffect, useState } from "react";
import GetImage from "../../../components/commons/getImage.component"
import { useAppSelector } from "../../../store/hooks";
import MedalSVG from "../../citizens/common/SVG/medalSVG.ui"
import LockSVG from "../../citizens/common/SVG/lockSVG.ui";
import { AnyFeature } from "../../../types/citizens.type";
import { FeatureKind } from "../../../enums/citizens/common.enum";

interface OptionCardUIProps {
  option: AnyFeature,
  isActive?: boolean
}

export default function OptionCardUI({ option, isActive }: OptionCardUIProps) {
  const userXP = useAppSelector(state => state.citizensAuth.xpData);
  const didMarketplaceMode = useAppSelector(state => state.citizensMetadata.marketplaceMode);

  const [hasRequiredXP, setHasRequiredXP] = useState<boolean>(false);

  useEffect(() => {
    if (option.kind === FeatureKind.ClaimableDrop && option.requiredXP && userXP) {
      setHasRequiredXP(userXP.xp > option.requiredXP);
    }
  }, [option, userXP]);

  return (
    <div className={`relative w-28 xl:w-[132px] dark:xl:w-[164px] h-28 xl:h-[170px] dark:xl:h-[206px] rounded-lg overflow-hidden cursor-pointer`}>
      <div className="relative bg-[#3d3d3d] w-full h-28 xl:h-[132px] dark:xl:h-[164px] flex justify-center items-center font-semibold">
        <GetImage url={option.thumb} alt={option.path} />
        {
          didMarketplaceMode && option.kind === FeatureKind.ClaimableDrop && option.price != undefined ?
            <>
              <div className="absolute inset-2 flex gap-2">
                {/* PRICE */}
                <div className={`${((!hasRequiredXP && option.requiredXP) || option.isLimitReached) ? 'hidden' : ''} bg-citizens-red w-fit h-fit text-[10px] px-2 py-1 rounded-full`}>
                  {option.price <= 0 ? 'FREE' : (option.price + ' ' + option.paymentType)}
                </div>
                {option.isLimitReached ?
                  // LIMIT REACHED
                  <div className="bg-citizens-yellow w-fit h-fit text-[10px] px-2 py-1 rounded-full text-citizens-dark">
                    Limit is reached
                  </div>
                  :
                  <>
                  {/* REQUIRED EXPERIENCE */}
                    {
                      !hasRequiredXP && option.requiredXP ?
                        <div className="bg-citizens-yellow w-fit h-fit text-[10px] px-2 py-1 rounded-full text-citizens-dark">
                          {option.requiredXP} XP
                        </div> : null
                    }
                  </>
                }
              </div>
              {/* BLOCK ICON */}
              {(!hasRequiredXP && option.requiredXP) || option.isLimitReached ?
                <div className="absolute right-2 bottom-6 xl:bottom-2 w-5 h-5 bg-citizens-yellow flex justify-center pt-[2px] rounded-full">
                  <LockSVG />
                </div> : null
              }
            </>
            :
            <>
              <div className="absolute inset-1 xl:inset-2 bg-citizens-bluedark w-fit h-fit text-[10px] xl:text-xs text-white px-2 py-1 rounded-full">
                {option.kind === FeatureKind.Drop || option.kind === FeatureKind.ClaimableDrop ? `${option.balance} ${option.balance === 1 ? 'unit' : 'units'}` : 'BASE'}
              </div>
              <div className="absolute right-1 xl:right-2 top-1 xl:top-2">
                <MedalSVG withCircle={isActive} />
              </div>
            </>
        }
      </div>
      <div className={`absolute bottom-0 xl:relative w-full h-4 xl:h-[38px] dark:xl:h-[42px] flex justify-center items-center ${isActive ? 'bg-accent' : 'bg-white'}`}>
        {/* NAME */}
        <p className={`font-poppins font-medium text-[10px] xl:text-sm uppercase w-full px-2 text-center truncate ${isActive ? 'text-white' : 'text-gray-normal'}`}>{option.name}</p>
        {/* TAG */}
        {option.tag &&
          <div className="absolute bottom-full left-0 w-full flex justify-center">
            <div className="bg-citizens-bluedark px-3 py-1 rounded-t-md text-xs">{option.tag}</div>
          </div>
        }
      </div>
    </div>
  )
}