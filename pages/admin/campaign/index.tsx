import Head from "next/head"
import Layout from "../../../ui/admin/admin.layout"
import AGLoading from "../../../ui/common/ag-loading.component"
import EditCampaignUI from "../../../ui/admin/campaign/editCampaign/editCampaign.ui"
import { GetFileUrl } from "../../../utils/firebase.util";

async function downloadFIle(path: string) {
  const fileLink = await GetFileUrl(path);
  if (fileLink === undefined) return alert('error on file download, file link is undefined.')
  window.open(fileLink, '_blank');
}

export default function Campaign() {
  return (
    <>
      <Head>
        <title>Admin - Campaign</title>
      </Head>
      <Layout>
        <EditCampaignUI downloadFile={(path: string) => void downloadFIle(path)} />
      </Layout>
      <AGLoading loading={false} bgColor="F1F5F9" />
    </>
  )
}