import {Component} from "react";
import {GetCurrentUser, GetUserInfo, HandleNotLoggedIn, LogOut} from "../../utils/firebase.util";
import {UserInterface} from "../../interfaces/firebase.interface";
import AGButton from "../common/ag-button.component";
import {UserRoleValues} from "../../enums/firebase.enum";

interface LayoutProps {
  children: JSX.Element | JSX.Element[];
  userInfo?: UserInterface;
  currentCampaign?: string;
  setUserInfo: (user?: UserInterface) => void;
  setCurrentCampaign: (campaign?: string) => void;
}

export default class Layout extends Component<LayoutProps> {
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
      this.props.setUserInfo(uInfo);
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
    const { userInfo, currentCampaign } = this.props;
    
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
                        <span>👨‍🌾: </span>{userInfo.role != undefined ? UserRoleValues[userInfo.role] : 'missing'}
                    </p>
                    <div className="ml-2 flex">
                        <p>🚩:</p>
                        <select className="ml-1" defaultValue={currentCampaign}
                                onChange={e => this.props.setCurrentCampaign(e.target.value)}>
                            <option value=''>Select...</option>
                          {this.renderCampaignOptions()}
                        </select>
                    </div>
                </div>
            }
          </div>
          <AGButton type="danger" onClickEvent={() => void LogOut()}>Log Out</AGButton>
        </div>
        {this.props.children}
      </>
    );
  }
  
  private renderCampaignOptions() {
    const {userInfo} = this.props;
    if (!(userInfo && userInfo.campaign?.length > 0))
      return <></>;
    
    userInfo.campaign.map(campaign => {
      return <option value={campaign} key={`key_${campaign}`}>{campaign}</option>
    });
  }
}