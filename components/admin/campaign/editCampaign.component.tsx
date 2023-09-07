import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import EditCampaignUI from "../../../ui/admin/campaign/editCampaign/editCampaign.ui";
import { GetFileUrl, UpdateDocObject } from "../../../utils/firebase.util";
import { ShowModal } from "../../../utils/modal.util";
import { fetchData } from "../../../store/currentCampaignSlice";
import { FirestoreLocation } from "../../../enums/firebase.enum";
import { AuthStateInterface, CampaignParameters, ColorConfig, LookAtVectors } from "../../../interfaces/common.interface";
import { CameraConfigOption } from "../../../enums/campaign.enum";
import { GoToPage } from "../../../utils/router.util";
import { PageLocation } from "../../../enums/common.enum";

export default function EditCampaign() {
  const campaignName = useAppSelector(state => state.currentCampaign.name);
  const userData: AuthStateInterface = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  async function downloadFile(path: string) {
    const fileLink = await GetFileUrl(path);
    if (fileLink === undefined) return ShowModal('error on file download, file link is undefined.');
    window.open(fileLink, '_blank');
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

  useEffect(() => {
    if (!userData.connected) return
    campaignName.length > 0 ? fetchAllCampaignData() : void GoToPage(PageLocation.Admin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <EditCampaignUI
        downloadFile={(path: string) => downloadFile(path)}
        updateColorConfig={(element: string, config: ColorConfig) => updateColorConfig(element, config)}
        updateCameraConfig={(element: string, config: LookAtVectors) => updateCameraConfig(element, config)}
      />
    </>
  )
}