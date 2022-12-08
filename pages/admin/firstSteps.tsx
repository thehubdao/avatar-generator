import {Component} from "react";
import NewCampaign from "../../components/admin/new-campaign.component";
import Layout from "../../components/admin/_layout.component";
import {UserInterface} from "../../interfaces/firebase.interface";
import Head from "next/head";
import AGText from "../../components/common/ag-text.component";

interface PageState {
  userInfo?: UserInterface;
}

export default class FirstStepsPage extends Component<undefined, PageState> {
  private setUserInfo(user?: UserInterface) {
    this.setState({
      userInfo: user,
    });
  }
  
  render() {
    return (
      <>
        <Head>
          <title>First Steps</title>
        </Head>
        <Layout setUserInfo={(user) => this.setUserInfo(user)}
                userInfo={this.state?.userInfo}
                noCampaign
                setCurrentCampaign={() => void {}}>
          <AGText type="th1">First Steps</AGText>
          <NewCampaign/>
        </Layout>
      </>
    );
  }
}