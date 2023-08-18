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

interface CreateAssetProps {
  objectFile?: File | null;
  thumbnailFile?: File | null;
}

export default function CreateAsset({ objectFile, thumbnailFile }: CreateAssetProps) {
  const campaignName = useAppSelector(state => state.currentCampaign.name);
  const assetName = useAppSelector(state => state.addAsset.name);
  const assetLocation = useAppSelector(state => state.addAsset.location);
  const assetType = useAppSelector(state => state.addAsset.type);
  const isAssetReady = useAppSelector(state => state.addAsset.ready);

  const dispatch = useAppDispatch();

  async function submitAsset() {
    let newFile, newThumb;

    const formData: Partial<AssetInterface> = {};

    formData.name = assetName;
    formData.type = assetType;

    if (objectFile) {
      newFile = await UploadFile(objectFile, uploadTo(), formData.type, campaignName);
      if (newFile) formData.path = newFile
      else return alert('Model upload failed!');
    }

    if (thumbnailFile) {
      newThumb = await UploadFile(thumbnailFile, StorageLocation.Thumbnail, formData.type, campaignName);
      if (newThumb) formData.thumb = newThumb
      else return alert('Thumbnail upload failed!');
    }

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
      case FirestoreLocation.Stages:
        return StorageLocation.Stage;
      default:
        return StorageLocation.Missing;
    }
  }

  useEffect(() => {
    if (isAssetReady) {
      void submitAsset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAssetReady])

  useEffect(() => {
    if (campaignName.length <= 0) void GoToPage(PageLocation.Admin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <></>
  )
}