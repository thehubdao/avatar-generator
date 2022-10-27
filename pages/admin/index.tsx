import {Component} from "react";
import Layout from "../../components/admin/_layout.component";
import Navbar from "../../components/admin/navbar.component";
import {UserInterface} from "../../interfaces/firebase.interface";

interface AdminState {
  userInfo?: UserInterface;
  selectedCampaign?: string;
}

export default class Admin extends Component<undefined, AdminState> {
  constructor(props: undefined) {
    super(props);
    this.state = {
      // selectedCampaign: 'decentraland'
    };
  }
  
  setUserInfo(user?: UserInterface) {
    this.setState({
      userInfo: user,
      selectedCampaign: user?.campaign?.at(0),
    });
  }
  
  setCurrentCampaign(campaign?: string) {
    this.setState({
      selectedCampaign: campaign,
    })
  }
  
  render() {
    const { userInfo, selectedCampaign } = this.state;
    
    return (
      <>
        <Layout userInfo={userInfo}
                currentCampaign={selectedCampaign}
                setUserInfo={(user) => this.setUserInfo(user)}
                setCurrentCampaign={(campaign) => this.setCurrentCampaign(campaign)}>
          <Navbar userRole={userInfo?.role} campaign={selectedCampaign}>
          </Navbar>
        </Layout>
      </>
    );
  }
}