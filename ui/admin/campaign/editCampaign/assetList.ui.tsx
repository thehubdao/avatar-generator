import { useAppSelector } from "../../../../store/hooks";
import AssetCard from "./assetCard.ui";
import { AssetType } from "../../../../types/asset.type";
import { FirestoreLocation } from "../../../../enums/firebase.enum";
import AGButton from "../../../common/ag-button.component";
import { IoMdAddCircleOutline } from "react-icons/io";
import { GoToPage } from "../../../../utils/router.util";
import { PageLocation } from "../../../../enums/common.enum";

interface AssetListInterface {
  activedOption: FirestoreLocation,
}

interface CampaignAssetsInterface {
  features: AssetType[],
  accessories: AssetType[],
  animations: AssetType[],
  environments: AssetType[]
}

export default function AssetList({ activedOption }: AssetListInterface) {
  const campaignAssets = useAppSelector(state => state.currentCampaign.assets);

  return (
    <div className="flex flex-wrap gap-6">
      {
        campaignAssets[activedOption as keyof CampaignAssetsInterface] && (campaignAssets[activedOption as keyof CampaignAssetsInterface] as AssetType[]).length > 0 ?
          (campaignAssets[activedOption as keyof CampaignAssetsInterface] as AssetType[]).map((asset: AssetType) => {
            return (
              <div key={asset.id}>
                <AssetCard id={asset.id} name={asset.name} thumb={asset.thumb} location={activedOption} />
              </div>
            )
          })
          :
          <div className="w-full mx-2 flex items-center gap-5">
            <p>{`No ${activedOption} to show`}</p>
            <AGButton nm onClickEvent={() => void GoToPage(PageLocation.AssetCreate)}>
              <div className={`flex items-center gap-2 p-2 font-poppins text-blue`}>
                <IoMdAddCircleOutline className="text-2xl" />
                <p>Create a new asset</p>
              </div>
            </AGButton>
          </div>
      }
    </div>
  )
}