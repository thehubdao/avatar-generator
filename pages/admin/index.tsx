import { useState } from "react";
import Head from "next/head";
import { UserInterface } from "../../interfaces/firebase.interface";
import Layout from "../../components/admin/_layout.component";
import AGLoading from "../../ui/common/ag-loading.component";
import Dashboard from "../../components/admin/dashboard.component";

export default function Admin() {
  const [loading, setLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInterface>();

  function updateUserInfo(user?: UserInterface) {
    setLoading(false);
    setUserInfo(user);
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <AGLoading loading={loading} transparency />
      <Layout userInfo={userInfo}
        setUserInfo={(user) => updateUserInfo(user)}>
        {!loading &&
          <Dashboard userRole={userInfo?.role} campaignList={userInfo?.campaign}>
          </Dashboard>
        }
      </Layout>
    </>
  );
}