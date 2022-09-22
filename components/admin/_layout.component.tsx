import {Component} from "react";
import {GetCurrentUser, GetUserInfo, HandleNotLoggedIn, LogOut} from "../../utils/firebase.util";
import {UserInterface} from "../../interfaces/firebase.interface";
import AGButton from "../common/ag-button.component";
import {UserRoleValues} from "../../enums/firebase.enum";

interface LayoutProps {
  userInfo?: UserInterface;
  children: JSX.Element | JSX.Element[];
  getUserInfo: (user?: UserInterface) => void;
}

interface LayoutState {
}

export default class Layout extends Component<LayoutProps, LayoutState> {
  async componentDidMount() {
    const isNotLogIn = await HandleNotLoggedIn();
    if(isNotLogIn)
      return;

    await this.setUserInfo();
  }
  
  async setUserInfo() {
    const currentUser = await GetCurrentUser();
    if(currentUser) {
      const uInfo = await GetUserInfo(currentUser.uid);
      this.props.getUserInfo(uInfo);
    }
  }
  
  getUserOrEmail() {
    const {userInfo} = this.props;
    if (userInfo?.email == undefined)
      return '';
    
    if(!userInfo.email.includes('@freak.com'))
      return userInfo.email;

    return userInfo.email.substring(0, userInfo.email.indexOf('@'));
  }

  render() {
    const { userInfo } = this.props;
    
    return (
      <>
        <div className="bg-emerald-500 flex justify-between">
          <div className="ml-3 mr-1 my-2 flex">
            { userInfo &&
            <div className="my-auto flex flex-col sm:flex-row">
              <p className="font-bold">{userInfo.name}</p>
              <p className="ml-2">
                <span>🧔‍♀️: </span>{this.getUserOrEmail()}
              </p>
              <p className="ml-2">
                <span>🚩: </span>{userInfo.role != undefined ? UserRoleValues[userInfo.role] : 'missing'}
              </p>
            </div> }
          </div>
          <AGButton type="danger" onClickEvent={LogOut}>Log Out</AGButton>
        </div>
        {this.props.children}
      </>
    );
  }
}