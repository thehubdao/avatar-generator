import { useEffect, useState } from "react";
import Head from "next/head";
import { UserInterface } from "../../interfaces/firebase.interface";
import Layout from "../../layouts/admin.layout";
import AGLoading from "../../ui/common/ag-loading.component";
import { GetCurrentUserInfo } from "../../utils/firebase.util";
import Campaigns from "../../ui/admin/campaign/editCampaign/campaignList.ui";

export default function Admin() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInterface>({
    role: 0,
    name: '',
    account: '',
    email: '',
    campaign: []
  });

  async function updateUserInfo() {
    const uInfo = await GetCurrentUserInfo();
    setIsLoading(false);
    uInfo && setUserInfo(uInfo);
  }

  useEffect(() => {
    const componentDidMount = async () => {
      await updateUserInfo();
    };

    componentDidMount().catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <Layout>
        <Campaigns userInfo={userInfo} />
      </Layout>
      <AGLoading loading={isLoading} bgColor="F1F5F9" />
    </>
  );
}