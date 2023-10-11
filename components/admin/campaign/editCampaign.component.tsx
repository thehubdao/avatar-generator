import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import EditCampaignUI from "../../../ui/admin/campaign/editCampaign/editCampaign.ui";
import { GetFileUrl, UpdateCampaignParameter, UpdateDocObject, UploadFile } from "../../../utils/firebase.util";
import { ShowModal } from "../../../utils/modal.util";
import { fetchData } from "../../../store/currentCampaignSlice";
import { FirestoreLocation, StorageLocation } from "../../../enums/firebase.enum";
import { AuthStateInterface, CampaignParameters, ColorConfig, LookAtVectors } from "../../../interfaces/common.interface";
import { CameraConfigOption } from "../../../enums/campaign.enum";
import { GoToPage } from "../../../utils/router.util";
import { Module, PageLocation } from "../../../enums/common.enum";
import { LogError } from "../../../utils/common.util";
import { useRouter } from "next/navigation";

export default function EditCampaign() {
  const campaignName = useAppSelector(state => state.currentCampaign.name);
  const userData: AuthStateInterface = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userData.connected) return
    campaignName.length > 0 ? fetchAllCampaignData() : void GoToPage(PageLocation.Admin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  async function downloadFile(path: string) {
    const fileLink = await GetFileUrl(path);
    if (!fileLink.success) return ShowModal("Error downloading the file, file link doesn't exist.");
    window.open(fileLink.value, '_blank');
  }

  const fetchAllCampaignData = () => {
    void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.Parameters }));
    void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.Features }));
    void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.Accessories }));
    void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.Animations }));
    void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.Stages }));
    void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.EnvMaps }));
  }

  const updateColorConfig = async (element: string, config: ColorConfig) => {
    const newParameters: Partial<CampaignParameters> = { config: { skin: config } };
    const result = await UpdateDocObject(FirestoreLocation.Parameters, newParameters, campaignName);
    result.success ? ShowModal('Update color config sucessful') : ShowModal('Update color config failed');
  }

  const updateCameraConfig = async (element: string, config: LookAtVectors) => {
    let newParameters: Partial<CampaignParameters>;
    if (element != CameraConfigOption.DefCam) {
      const newConfig = { [element]: config };
      newParameters = { config: { featuresCamPos: newConfig } };
    } else {
      newParameters = { config: { defCam: config } };
    }
    // console.log(newParameters, location);
    const result = await UpdateDocObject(FirestoreLocation.Parameters, newParameters, campaignName);

    if (result.success) {
      ShowModal(`Update ${element} camera config sucessful`)
      void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.Parameters }));
    } else {
      ShowModal(`Update ${element} camera config failed`);
    }
  }

  const updateDefaultAsset = async (element: string, config: string) => {
    const newConfig = { [element]: config };
    const newParameters: Partial<CampaignParameters> = { config: newConfig };
    // console.log(newParameters, location);
    const result = await UpdateDocObject(FirestoreLocation.Parameters, newParameters, campaignName);

    if (result.success) {
      ShowModal(`Update ${element} asset default config sucessful`)
      void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.Parameters }));
    } else {
      ShowModal(`Update ${element} asset default config failed`);
    }
  }

  async function uploadAvatarBase(newAvatarBase: File | undefined) {
    if (newAvatarBase == undefined)
      return void LogError(Module.EditCampaign, "Missing AvatarBase to update!");

    const uploadedFile = await UploadFile(newAvatarBase, StorageLocation.AvatarBase, undefined, campaignName);
    if (uploadedFile == undefined)
      return void LogError(Module.EditCampaign, "Error uploading new AvatarBase");

    const updateResult = await UpdateCampaignParameter({ armature: uploadedFile }, campaignName);
    if (updateResult.success) {
      ShowModal("AvatarBase updated!");
      router.refresh();
    } else {
      ShowModal("Errors updating AvatarBase!");
    }
  }


  return (
    <>
      <EditCampaignUI
        downloadFile={(path: string) => downloadFile(path)}
        updateColorConfig={(element: string, config: ColorConfig) => updateColorConfig(element, config)}
        updateCameraConfig={(element: string, config: LookAtVectors) => updateCameraConfig(element, config)}
        updateDefaultAsset={(element: string, config: string) => updateDefaultAsset(element, config)}
        uploadAvatarBase={uploadAvatarBase}
      />
    </>
  )
}