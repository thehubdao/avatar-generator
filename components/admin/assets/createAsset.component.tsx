import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { FirestoreLocation, StorageLocation } from "../../../enums/firebase.enum";
import { AssetInterface } from "../../../interfaces/api.interface";
import { InsertDoc, UpdateDoc, UploadFile } from "../../../utils/firebase.util";
import { LogError } from "../../../utils/common.util";
import { Module, PageLocation } from "../../../enums/common.enum";
import { reset } from "../../../store/addAssetSlice";
import { GoToPage } from "../../../utils/router.util";
import { ShowModal } from "../../../utils/modal.util";

interface CreateAssetInterface {
  objectFile?: File | null;
  thumbnailFile?: File | null;
}

export default function CreateAsset({ objectFile, thumbnailFile }: CreateAssetInterface) {
  const campaignName = useAppSelector(state => state.currentCampaign.name);
  const assetName = useAppSelector(state => state.addAsset.name);
  const assetLocation = useAppSelector(state => state.addAsset.location);
  const assetStorage = useAppSelector(state => state.addAsset.storage);
  const assetReady = useAppSelector(state => state.addAsset.ready);

  const dispatch = useAppDispatch();

  async function submitAsset() {
    const uploadFileTo = uploadTo();
    const leFile = objectFile;
    const leThumb = thumbnailFile;

    const formData: Partial<AssetInterface> = {};

    formData.name = assetName;
    formData.type = assetStorage;

    formData.thumb = await UploadFile(leThumb, StorageLocation.Thumbnail, formData.type, campaignName) as string;
    formData.path = await UploadFile(leFile, uploadFileTo, formData.type, campaignName) as string;

    await insertDB(JSON.stringify(formData));
  }

  async function insertDB(_jsonData: string) {
    if (!(assetLocation && _jsonData)) return LogError(Module.AssetAdd, "Missing Data/Location to save new asset!");

    if (assetLocation !== FirestoreLocation.Parameters) {
      await InsertDoc(_jsonData, assetLocation, campaignName);
      dispatch(reset());
      ShowModal('Done inserting');
      void GoToPage(PageLocation.AdminCampaign);
    } else {
      await UpdateDoc(_jsonData, assetLocation, campaignName);
      dispatch(reset());
      ShowModal('Done updating');
      void GoToPage(PageLocation.AdminCampaign);
    }
  }

  function uploadTo() {
    switch (assetLocation) {
      case FirestoreLocation.Features:
        return StorageLocation.Feature;
      case FirestoreLocation.Accessories:
        return StorageLocation.Accessory;
      case FirestoreLocation.Animations:
        return StorageLocation.Animation;
      case FirestoreLocation.Environments:
        return StorageLocation.Environment;
      default:
        return StorageLocation.Missing;
    }
  }

  useEffect(() => {
    if (assetReady) {
      void submitAsset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetReady])

  return (
    <></>
  )
}