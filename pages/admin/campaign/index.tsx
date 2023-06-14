import Head from "next/head"
import Layout from "../../../ui/admin/admin.layout"
import AGLoading from "../../../ui/common/ag-loading.component"
import EditCampaignUI from "../../../ui/admin/campaign/editCampaign/editCampaign.ui"

export default function Campaign() {
  return (
    <>
      <Head>
        <title>Admin - Campaign</title>
      </Head>
      <Layout>
        <EditCampaignUI />
      </Layout>
      <AGLoading loading={false} bgColor="F1F5F9" />
    </>
  )
}