import EditCampaignUI from "../../../ui/admin/campaign/editCampaign/editCampaign.ui";
import { GetFileUrl } from "../../../utils/firebase.util";
import { ShowModal } from "../../../utils/modal.util";

export default function EditCampaign() {

  async function downloadFile(path: string) {
    const fileLink = await GetFileUrl(path);
    if (fileLink === undefined) return ShowModal('error on file download, file link is undefined.');
    window.open(fileLink, '_blank');
  }
  
  return (
    <>
    <EditCampaignUI downloadFile={(path: string) => downloadFile(path)} />
    </>
  )
}