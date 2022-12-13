import {useState} from "react";
import NewCampaign from "../../components/admin/new-campaign.component";
import Layout from "../../components/admin/_layout.component";
import {UserInterface} from "../../interfaces/firebase.interface";
import Head from "next/head";
import AGText from "../../components/common/ag-text.component";
import {GoToPage} from "../../utils/router.util";
import {PageLocation} from "../../enums/common.enum";

export default function FirstStepsPage() {
  const [userInfo, setUserInfo] = useState<UserInterface>();

  async function onCampaignCreated(didCreate: boolean) {
    if (didCreate)
      await GoToPage(PageLocation.Admin);
  }

  return (
    <>
      <Head>
        <title>First Steps</title>
      </Head>
      <Layout setUserInfo={(user) => setUserInfo(user)}
              userInfo={userInfo}
              noCampaign
              setCurrentCampaign={() => void {}}>
        <AGText type="th1">First Steps</AGText>
        <NewCampaign onCampaignCreated={(flag) => onCampaignCreated(flag)}/>
      </Layout>
    </>
  );
}