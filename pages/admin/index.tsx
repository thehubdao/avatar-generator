import Head from "next/head";
import Layout from "../../layouts/admin.layout";
import CampaignListComponent from "../../components/admin/campaign/campaignList.component";

export default function Admin() {
  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <Layout>
        <CampaignListComponent />
      </Layout>
    </>
  );
}