import { useAppSelector } from "../../../../store/hooks";
import AssetCard from "./assetCard.ui";
import { AssetType } from "../../../../types/asset.type";
import { FirestoreLocation } from "../../../../enums/firebase.enum";

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
        campaignAssets[activedOption as keyof CampaignAssetsInterface] ?
        (campaignAssets[activedOption as keyof CampaignAssetsInterface] as AssetType[]).map((asset: AssetType) => {
          return (
            <div key={asset.id}>
              <AssetCard id={asset.id} name={asset.name} thumb={asset.thumb} location={activedOption} />
            </div>
          )
        })
        :
        <p>No Data to show</p>
      }
    </div>
  )
}