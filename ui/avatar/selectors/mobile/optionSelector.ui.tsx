import 'swiper/css';
import { BasicData } from '../../../../interfaces/common.interface';
import { MouseEvent } from "react";
import OptionCardUI from "../optionCard.ui";
import { AnyFeature } from "../../../../types/citizens.type";
import { useAppSelector } from "../../../../store/hooks";
import { RootCampaignConstant } from "../../../../constants/campaign.constant";
import { FeatureKind } from "../../../../enums/citizens/common.enum";
import { RandomTier } from "../../../../enums/common.enum";

interface OptionSelectorUIProps {
  list: AnyFeature[];
  activeOption?: BasicData;
  handleClick: (id: string, path: string, name: string) => void;
}

export default function OptionSelectorUI({ list, activeOption, handleClick }: OptionSelectorUIProps) {
  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const didMarketplaceMode = useAppSelector(state => state.citizensMetadata.marketplaceMode);

  const selectFeature = (e: MouseEvent<HTMLDivElement>, opt: AnyFeature) => {
    e.preventDefault();
    
    // For Root Network in marketplace mode: Block if limit is reached
    const isRootNetwork = selectedCampaign === RootCampaignConstant.Based;
    if (isRootNetwork && didMarketplaceMode && opt.kind === FeatureKind.ClaimableDrop && opt.isLimitReached) {
      return; // Silently block the action
    }
    
    handleClick(opt.id, opt.path, opt.name);
  }
  return (
    <div className='w-full px-2 flex flex-wrap overflow-y-scroll gap-2 justify-center h-fit items-center'>
      {list.length > 0 ?
        list.map((opt, index) => (
          <div key={opt.id + index} onClick={event => selectFeature(event, opt)}>
            <OptionCardUI option={opt} isActive={activeOption && activeOption.val === opt.name} />
          </div>
        ))
        :
        <OptionCardUI option={{
          id: 'empty',
          index: 0,
          name: 'No options',
          type: 'empty',
          tier: RandomTier.Common,
          path: '',
        } as AnyFeature} />
      }
    </div>
  )
}