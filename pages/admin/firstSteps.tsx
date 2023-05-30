import {useEffect, useState} from "react";
import Layout from "../../components/admin/_layout.component";
import {UserInterface} from "../../interfaces/firebase.interface";
import Head from "next/head";
import AGText from "../../ui/common/ag-text.component";
import {GoToPage} from "../../utils/router.util";
import {PageLocation} from "../../enums/common.enum";
import CampaignAdd from "../../components/admin/campaign/add.component";
import {GetCurrentUserInfo} from "../../utils/firebase.util";

export default function FirstStepsPage() {
  const [userInfo, setUserInfo] = useState<UserInterface>();
  
  // useEffect(() => {
  //   if(userInfo != undefined && userInfo.campaign.length > 0)
  //     void GoToPage(PageLocation.Admin);
  // }, [userInfo]);

  async function onCampaignCreated(didCreate: boolean) {
    if (didCreate) {
      setUserInfo(await GetCurrentUserInfo(true));
      await GoToPage(PageLocation.Admin);
    }
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
        <CampaignAdd onCampaignCreated={(flag) => void onCampaignCreated(flag)}/>
      </Layout>
    </>
  );
}