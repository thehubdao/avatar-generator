import { useEffect } from "react";
import { ReplaceDoc, UploadFile } from "../../../utils/firebase.util";
import { useAppSelector } from "../../../store/hooks";
import { FirestoreGlobalLocation, FirestoreLocation, StorageLocation } from "../../../enums/firebase.enum";
import { AssetInterface } from "../../../interfaces/api.interface";
import { CampaignAssets } from "../../../interfaces/common.interface";

interface UpdateAssetProps {
  objectFile?: File | null,
  thumbnailFile?: File | null,
  id: string,
  name?: string,
  location: FirestoreLocation,
  assetReady: boolean,
  onUpdated: () => void
}

export default function UpdateAsset({ objectFile, thumbnailFile, name, id, location, assetReady, onUpdated }: UpdateAssetProps) {
  const campaignName = useAppSelector(state => state.currentCampaign.name);
  const campaignAssets = useAppSelector(state => state.currentCampaign.assets);

  async function updateData() {
    if (location == undefined) return alert('Missing document location to update!');

    const currentAsset: Partial<AssetInterface> = { ...campaignAssets[location as keyof CampaignAssets]?.find(el => el.id === id) };
    let newFile, newThumb;

    if (name && name.length > 0) {
      currentAsset.name = name
    }

    if (objectFile) {
      newFile = await UploadFile(objectFile, uploadTo(), currentAsset.type, campaignName);
      if (newFile) currentAsset.path = newFile
      else return alert('Model upload failed!');
    }

    if (thumbnailFile) {
      newThumb = await UploadFile(thumbnailFile, StorageLocation.Thumbnail, currentAsset.type, campaignName);
      if (newThumb) currentAsset.thumb = newThumb
      else return alert('Thumbnail upload failed!');
    }

    const loc = `/${location}/${id}`;
    const docLocation = campaignName != undefined ?
      `${FirestoreGlobalLocation.Campaign}/${campaignName}${loc}` :
      location;

    await ReplaceDoc(docLocation, JSON.stringify(currentAsset));
    alert(`Doc "${docLocation}" has been updated`);

    onUpdated();
  }

  function uploadTo() {
    switch (location) {
      case FirestoreLocation.Features:
        return StorageLocation.Feature;
      case FirestoreLocation.Accessories:
        return StorageLocation.Accessory;
      case FirestoreLocation.Animations:
        return StorageLocation.Animation;
      case FirestoreLocation.Stages:
        return StorageLocation.Stage;
      default:
        return StorageLocation.Missing;
    }
  }

  useEffect(() => {
    if (assetReady) {
      void updateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetReady])

  return (
    <></>
  )
}