import { useAppDispatch } from "../../../store/hooks";
import { ShowModal } from "../../../utils/modal.util";
import { DeleteCampaign, GetCurrentUserInfo } from "../../../utils/firebase.util";
import CampaignListUI from "../../../ui/admin/campaign/editCampaign/campaignList.ui";
import { FirestoreLocation } from "../../../enums/firebase.enum";
import { fetchData } from "../../../store/currentCampaignSlice";
import { setUserInfo } from "../../../store/authSlice";

export default function CampaignListComponent() {
  const dispatch = useAppDispatch();

  const deleteCampaign = async (campaign: string) => {
    const result = await DeleteCampaign(campaign);

    if (result.success) {
      ShowModal(`Delete ${campaign} campaign sucessful`)
      void dispatch(fetchData({ campaign: campaign, location: FirestoreLocation.Parameters }));

      const uInfo = await GetCurrentUserInfo(true);
      if (uInfo) {
        void dispatch(setUserInfo(uInfo));
      }

    } else {
      ShowModal(`Delete ${campaign} campaign failed`);
    }
  }

  return (
    <CampaignListUI deleteCampaign={deleteCampaign} />
  )
}