import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import EditCampaignUI from "../../../ui/admin/campaign/editCampaign/editCampaign.ui";
import { GetFileUrl } from "../../../utils/firebase.util";
import { ShowModal } from "../../../utils/modal.util";
import { fetchData } from "../../../store/currentCampaignSlice";
import { FirestoreLocation } from "../../../enums/firebase.enum";

export default function EditCampaign() {
  const campaignName = useAppSelector(state => state.currentCampaign.name);
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
    void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.Scenarios }));
    void dispatch(fetchData({ campaign: campaignName, location: FirestoreLocation.EnvMaps }));
  }

  useEffect(() => {
    fetchAllCampaignData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <>
    <EditCampaignUI downloadFile={(path: string) => downloadFile(path)} />
    </>
  )
}