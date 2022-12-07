import {Component} from "react";
import Head from "next/head";
import Layout from "../../components/admin/_layout.component";
import Navbar from "../../components/admin/navbar.component";
import {UserInterface} from "../../interfaces/firebase.interface";
import AGLoading from "../../components/common/ag-loading.component";

interface AdminState {
  userInfo?: UserInterface;
  selectedCampaign?: string;
  loading: boolean;
}

export default class Admin extends Component<undefined, AdminState> {
  constructor(props: undefined) {
    super(props);
    this.state = {
      loading: true,
      // selectedCampaign: 'decentraland'
    };
  }
  
  private setUserInfo(user?: UserInterface) {
    this.setState({
      loading: false,
      userInfo: user,
      selectedCampaign: user?.campaign?.at(0),
    });
  }
  
  private setCurrentCampaign(campaign?: string) {
    this.setState({
      selectedCampaign: campaign,
    })
  }
  
  render() {
    const { userInfo, selectedCampaign, loading } = this.state;
    
    return (
      <>
        <Head>
          <title>Admin Dashboard</title>
        </Head>
        <AGLoading loading={loading} transparency/>
        <Layout userInfo={userInfo}
                currentCampaign={selectedCampaign}
                setUserInfo={(user) => this.setUserInfo(user)}
                setCurrentCampaign={(campaign) => this.setCurrentCampaign(campaign)}>
          { !loading &&
            <Navbar userRole={userInfo?.role} campaign={selectedCampaign}>
            </Navbar>
          }
        </Layout>
      </>
    );
  }
}