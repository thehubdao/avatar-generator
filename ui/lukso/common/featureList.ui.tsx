import { useEffect, useRef } from "react";
import { RandomTier } from "../../../enums/common.enum";
import { IndexFeatureInterface } from "../../../interfaces/api.interface";
import { gsap } from "gsap";

interface FeatureListUIProps {
  features: IndexFeatureInterface[]
}

function GetRaretyColor(opc: RandomTier) {
  switch (opc) {
    case RandomTier.Common:
        return 'text-gray-400'
      break;
    case RandomTier.Rare:
        return 'text-sky-400'
      break;
      case RandomTier.Epic:
        return 'text-violet-400'
      break;
    case RandomTier.Mythical:
        return 'text-pink-400'
      break;
    default:
      break;
  }
}

export default function FeatureListUI({features}: FeatureListUIProps) {
  const DOM = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (DOM.current) {
      const arrayEl = gsap.utils.toArray(DOM.current.children);
      
      gsap.to(arrayEl, {
        opacity: 1,
        duration: 1,
        stagger: 0.2
      })
    }
  }, [])
  return (
    <div ref={DOM} className={`grid grid-cols-2 py-10 gap-4 gap-x-14 text-sm 2xl:text-base w-full`}> 

      {
        features.map((feature, index) => {
          return (
            <div key={index} className=" opacity-0">
              <h3 className={`uppercase font-bold ${GetRaretyColor(feature.val.tier)}`}>{feature.val.type}</h3>
              <p className={`lowercase text-lg`}>{feature.val.name}</p>
              <p className={`capitalize text-sm leading-none ${GetRaretyColor(feature.val.tier)}`}>{feature.val.tier ?? '-'}</p>
            </div>
          )
        })
      }
    </div>
  )
}