import {Component} from "react";
import Layout from "../../components/admin/_layout.component";
import Navbar from "../../components/admin/navbar.component";
import {UserInterface} from "../../interfaces/firebase.interface";

interface AdminProps {
}

interface AdminState {
  userInfo?: UserInterface;
}

export default class Admin extends Component<AdminProps, AdminState> {
  constructor(props: AdminProps) {
    super(props);
    this.state = {};
  }
  
  setUserInfo(user?: UserInterface) {
    this.setState({
      userInfo: user
    });
  }
  
  render() {
    const { userInfo } = this.state;
    
    return (
      <>
        <Layout userInfo={userInfo} getUserInfo={(user?: UserInterface) => this.setUserInfo(user)}>
          <Navbar>
            <h1>Hello World!</h1>
          </Navbar>
        </Layout>
      </>
    );
  }
}