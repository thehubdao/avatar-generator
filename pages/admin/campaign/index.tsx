import Head from "next/head";
import Layout from "../../../layouts/admin.layout";
import EditCampaign from "../../../components/admin/campaign/editCampaign.component";

export default function Campaign() {
  return (
    <>
      <Head>
        <title>Admin - Campaign</title>
      </Head>
      <Layout>
        <EditCampaign />
      </Layout>
    </>
  )
}