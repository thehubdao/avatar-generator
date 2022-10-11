import {Component} from "react";
import {UserRoleValues} from "../../enums/firebase.enum";
import {AdminComponents} from "../../enums/common.enum";
import AssetList from "./assets/list.component";

interface NavbarProps {
  children: JSX.Element;
  userRole?: UserRoleValues;
  campaign?: string;
}

interface NavbarState {
  currentComponent: AdminComponents;
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
          <div className="flex-none w-20 h-screen bg-red-400 border-r-2 border-yellow-400">
            {this.renderNavBar()}
          </div>
          <div className="flex-auto h-full border-t-2 border-yellow-400 flex justify-center">
            <div className="my-auto w-full">
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
      </>
    );
  }

  private navAdmin() {
    return (
      <div className="flex flex-col">
        
      </div>
    );
  }

  private renderSelectedComponent() {
    const {currentComponent} = this.state;
    switch (currentComponent) {
      case AdminComponents.AssetList:
        return <AssetList campaign={this.props.campaign}
                          changeComponent={(nc) => this.setCurrentComponent(nc)} />
      case AdminComponents.AssetAdd:
      case AdminComponents.AssetModify:
      default:
        return <p>Missing Component!</p>;
    }
  }

  private setCurrentComponent(newComponent: AdminComponents) {
    this.setState({
      currentComponent: newComponent,
    });
  }
}