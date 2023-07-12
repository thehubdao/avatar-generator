import Head from "next/head";
import Layout from "../../../ui/admin/admin.layout";
import AGLoading from "../../../ui/common/ag-loading.component";
import CreateCampaignUI from "../../../ui/admin/campaign/createCampaign/createCampaign.ui";

export default function FirstSteps() {
  return (
    <>
      <Head>
        <title>Admin - Create campaign</title>
      </Head>
      <Layout>
        <CreateCampaignUI />
      </Layout>
      <AGLoading loading={false} bgColor="F1F5F9" />
    </>
  )
}