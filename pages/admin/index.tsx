import {useState} from "react";
import Head from "next/head";
import {UserInterface} from "../../interfaces/firebase.interface";
import Layout from "../../components/admin/_layout.component";
import AGLoading from "../../components/common/ag-loading.component";
import Dashboard from "../../components/admin/dashboard.component";

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
      <div className="bg-bg">
        <AGLoading loading={loading} transparency/>
        <Layout userInfo={userInfo}
                currentCampaign={selectedCampaign}
                setUserInfo={(user) => updateUserInfo(user)}
                setCurrentCampaign={(campaign) => setSelectedCampaign(campaign)}>
          {!loading &&
              <Dashboard userRole={userInfo?.role} campaign={selectedCampaign} campaignList={userInfo?.campaign}>
              </Dashboard>
          }
        </Layout>
      </div>
    </>
  );
}