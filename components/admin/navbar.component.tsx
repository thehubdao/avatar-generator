import {useState} from "react";
import {UserRoleValues} from "../../enums/firebase.enum";
import {AdminComponents} from "../../enums/common.enum";
import {AdminComponentParams} from "../../interfaces/common.interface";

//#region Components
//  Common
import AGButton from "../common/ag-button.component";
import AGText from "../common/ag-text.component";
//  Assets
import AssetList from "./assets/list.component";
import AssetAdd from "./assets/add.component";
import AssetUpdate from "./assets/update.component";
//  User
import UserAdd from "./user/add.component";
import UserList from "./user/list.component";
// Campaign
import CampaignAdd from "./campaign/add.component";

//#endregion Components

interface NavbarProps {
  children?: JSX.Element | JSX.Element[];
  userRole?: UserRoleValues;
  campaign?: string;
  campaignList?: string[];
}

export default function Navbar({userRole, campaign, campaignList}: NavbarProps) {
  const [currentComponent, setCurrentComponent] = useState<AdminComponents>(AdminComponents.AssetList);
  const [componentParams, setComponentParams] = useState<AdminComponentParams>();

  function renderNavBar(role: UserRoleValues | undefined = userRole) {
    switch (role) {
      case UserRoleValues.superAdmin:
        return navSuperAdmin();
      case UserRoleValues.admin:
        return navAdmin();
      default:
        return (<><p>Hello World!</p></>);
    }
  }

  function navSuperAdmin() {
    return (
      <>
        <AGButton type="alert" tooltip="Create user"
                  onClickEvent={() => setCurrentComponent(AdminComponents.UserAdd)}>
          <AGText type="icon">🤡</AGText>
        </AGButton>
        <AGButton type="alert" tooltip="User list"
                  onClickEvent={() => setCurrentComponent(AdminComponents.UserList)}>
          <AGText type="icon">👨‍👩‍👧‍👦</AGText>
        </AGButton>
        {navAdmin()}
      </>
    );
  }

  function navAdmin() {
    return (
      <>
        <AGButton type="primary" tooltip="Asset list"
                  onClickEvent={() => setCurrentComponent(AdminComponents.AssetList)}>
          <AGText type="icon">👯‍♀️</AGText>
        </AGButton>
        <AGButton type="primary" tooltip="Add Asset"
                  onClickEvent={() => setCurrentComponent(AdminComponents.AssetAdd)}>
          <AGText type="icon">😆</AGText>
        </AGButton>
        <AGButton type="secondary" tooltip="New Campaign"
                  onClickEvent={() => setCurrentComponent(AdminComponents.CampaignAdd)}>
          <AGText type="icon">⛺️</AGText>
        </AGButton>
        <AGButton type="secondary" tooltip="Config Campaign">
          <AGText type="icon">🏕️</AGText>
        </AGButton>
      </>
    );
  }

  function updateCurrentComponent(newComponent: AdminComponents, params?: AdminComponentParams) {
    setCurrentComponent(newComponent);
    setComponentParams(params);
  }

  function renderSelectedComponent() {
    switch (currentComponent) {
      case AdminComponents.AssetList:
        return <AssetList campaign={campaign}
                          changeComponent={(nc, params) => updateCurrentComponent(nc, params)}/>

      case AdminComponents.AssetAdd:
        return <AssetAdd campaign={campaign}
                         changeComponent={(nc) => updateCurrentComponent(nc)}/>

      case AdminComponents.AssetModify:
        return <AssetUpdate campaign={campaign}
                            docLocation={componentParams?.docLocation}
                            changeComponent={(nc) => updateCurrentComponent(nc)}/>

      case AdminComponents.UserAdd:
        return <UserAdd changeComponent={(nc) => updateCurrentComponent(nc)}/>

      case AdminComponents.UserList:
        return <UserList />

      case AdminComponents.CampaignAdd:
        return <CampaignAdd campaignList={campaignList}/>

      default:
        return <p>Missing Component!</p>;
    }
  }

  return (
    <>
      <div className="flex">
        <div className="flex-none max-h-full min-h-screen bg-red-400 border-r-2 border-yellow-400">
          {renderNavBar()}
        </div>
        <div className="flex-1 h-full border-t-2 border-yellow-400 flex justify-center">
          <div className="my-auto max-w-full">
            {renderSelectedComponent()}
          </div>
        </div>
      </div>
    </>
  );
}