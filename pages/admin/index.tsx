import {useState} from "react";
import Head from "next/head";
import {UserInterface} from "../../interfaces/firebase.interface";
import Layout from "../../components/admin/_layout.component";
import Navbar from "../../components/admin/navbar.component";
import AGLoading from "../../components/common/ag-loading.component";

export default function Admin() {
  const [loading, setLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInterface>();
  const [selectedCampaign, setSelectedCampaign] = useState<string>();

  function updateUserInfo(user?: UserInterface) {
    setLoading(false);
    setUserInfo(user);
    setSelectedCampaign(user?.campaign?.at(0));
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <AGLoading loading={loading} transparency/>
      <Layout userInfo={userInfo}
              currentCampaign={selectedCampaign}
              setUserInfo={(user) => updateUserInfo(user)}
              setCurrentCampaign={(campaign) => setSelectedCampaign(campaign)}>
        {!loading &&
            <Navbar userRole={userInfo?.role} campaign={selectedCampaign} campaignList={userInfo?.campaign}>
            </Navbar>
        }
      </Layout>
    </>
  );
}