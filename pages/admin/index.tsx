import Head from "next/head";
import Layout from "../../layouts/admin.layout";
import Campaigns from "../../ui/admin/campaign/editCampaign/campaignList.ui";

export default function Admin() {
  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <Layout>
        <Campaigns/>
      </Layout>
    </>
  );
}