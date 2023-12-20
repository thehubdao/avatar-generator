import Head from "next/head";
import Layout from "../../../layouts/admin.layout";
import CreateCampaign from "../../../components/admin/campaign/createCampaign.component";

export default function FirstSteps() {
  return (
    <>
      <Head>
        <title>Admin - Create campaign</title>
      </Head>
      <Layout>
        <CreateCampaign />
      </Layout>
    </>
  )
}