import {Component} from "react";
import {UserRoleValues} from "../../enums/firebase.enum";
import {AdminComponents} from "../../enums/common.enum";
import AssetList from "./assets/list.component";
import AGButton from "../common/ag-button.component";
import AGText from "../common/ag-text.component";
import AssetAdd from "./assets/add.component";
import {AdminComponentParams} from "../../interfaces/common.interface";
import AssetUpdate from "./assets/update.component";
import UserAdd from "./user/add.component";
import UserList from "./user/list.component";

interface NavbarProps {
  children?: JSX.Element | JSX.Element[];
  userRole?: UserRoleValues;
  campaign?: string;
}

interface NavbarState {
  currentComponent: AdminComponents;
  componentParams?: AdminComponentParams;
}

export default class Navbar extends Component<NavbarProps, NavbarState> {
  constructor(props: NavbarProps) {
    super(props);
    this.state = {
      currentComponent: AdminComponents.AssetList
    };
  }
  
  render() {
    return (
      <>
        <div className="flex">
          <div className="flex-none max-h-full min-h-screen bg-red-400 border-r-2 border-yellow-400">
            {this.renderNavBar()}
          </div>
          <div className="flex-1 h-full border-t-2 border-yellow-400 flex justify-center">
            <div className="my-auto max-w-full">
              {this.renderSelectedComponent()}
            </div>
          </div>
        </div>
      </>
    );
  }

  private renderNavBar(role: UserRoleValues | undefined = this.props.userRole) {
    switch (role) {
      case UserRoleValues.superAdmin:
        return this.navSuperAdmin();
      case UserRoleValues.admin:
        return this.navAdmin();
      default:
        return (<><p>Hello World!</p></>);
    }
  }

  private navSuperAdmin() {
    return (
      <>
        <AGButton type="alert" tooltip="Create user" onClickEvent={() => this.setCurrentComponent(AdminComponents.UserAdd)}>
          <AGText type="icon">🤡</AGText>
        </AGButton>
        <AGButton type="alert" tooltip="User list" onClickEvent={() => this.setCurrentComponent(AdminComponents.UserList)}>
          <AGText type="icon">👨‍👩‍👧‍👦</AGText>
        </AGButton>
        {this.navAdmin()}
      </>
    );
  }

  private navAdmin() {
    return (
      <>
        <AGButton type="primary" tooltip="Asset list" onClickEvent={() => this.setCurrentComponent(AdminComponents.AssetList)}>
          <AGText type="icon">👯‍♀️</AGText>
        </AGButton>
        <AGButton type="primary" tooltip="Add Asset" onClickEvent={() => this.setCurrentComponent(AdminComponents.AssetAdd)}>
          <AGText type="icon">😆</AGText>
        </AGButton>
        <AGButton type="secondary" tooltip="Config campaign">
          <AGText type="icon">⛺️</AGText>
        </AGButton>
      </>
    );
  }

  private renderSelectedComponent() {
    const {currentComponent} = this.state;
    switch (currentComponent) {
      case AdminComponents.AssetList:
        return <AssetList campaign={this.props.campaign}
                          changeComponent={(nc, params) => this.setCurrentComponent(nc, params)} />
      
      case AdminComponents.AssetAdd:
        return <AssetAdd campaign={this.props.campaign}
                         changeComponent={(nc) => this.setCurrentComponent(nc)} />
      
      case AdminComponents.AssetModify:
        return <AssetUpdate docLocation={this.state.componentParams?.docLocation}
                            changeComponent={(nc) => this.setCurrentComponent(nc)} />

      case AdminComponents.UserAdd:
        return <UserAdd />

      case AdminComponents.UserList:
        return <UserList changeComponent={nc => this.setCurrentComponent(nc)} />

      default:
        return <p>Missing Component!</p>;
    }
  }

  private setCurrentComponent(newComponent: AdminComponents, params?: AdminComponentParams) {
    this.setState({
      currentComponent: newComponent,
      componentParams: params,
    });
  }
}