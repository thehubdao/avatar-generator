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
    this.state = {};
  }
  
  setUserInfo(user?: UserInterface) {
    this.setState({
      userInfo: user
    });
  }
  
  setCurrentCampaign(campaign?: string) {
    this.setState({
      selectedCampaign: campaign,
    })
  }
  
  render() {
    const { userInfo } = this.state;
    
    return (
      <>
        <Layout userInfo={userInfo}
                setUserInfo={(user) => this.setUserInfo(user)}
                setCurrentCampaign={(campaign) => this.setCurrentCampaign(campaign)}>
          <Navbar userRole={userInfo?.role} campaign="decentraland">
            <h1>Hello World!</h1>
          </Navbar>
        </Layout>
      </>
    );
  }
}