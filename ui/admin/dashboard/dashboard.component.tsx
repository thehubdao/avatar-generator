import { useEffect, useState } from "react";
import { UserRoleValues } from "../../../enums/firebase.enum";
import { AdminComponents } from "../../../enums/common.enum";
import { AdminComponentParams } from "../../../interfaces/common.interface";

//#region Components
//  Common
import AGButton from "../../common/ag-button.component";
import AGText from "../../common/ag-text.component";
//  Assets
import AssetList from "../assets/list.component";
import AssetAdd from "../../../components/admin/assets/add.component";
import AssetUpdate from "../../../components/admin/assets/update.component";
//  User
import UserAdd from "../../../components/admin/user/add.component";
import UserList from "../../../components/admin/user/list.component";
// Campaign
import CampaignAdd from "../../../components/admin/campaign/add.component";

import Header from "./header.component";
import CampaignCard from "./campaignCard.component";

//#endregion Components

interface DashboardProps {
  children?: JSX.Element | JSX.Element[];
  userRole?: UserRoleValues;
  campaignList?: string[];
}

export default function Dashboard({ userRole, campaignList }: DashboardProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [currentComponent, setCurrentComponent] = useState<AdminComponents>(AdminComponents.AssetList);
  const [componentParams, setComponentParams] = useState<AdminComponentParams>();

  const [viewDashboard, setviewDashboard] = useState<boolean>(true);

  useEffect(() => {
    if (campaignList)
      setSelectedCampaign(campaignList[0]);
  }, [campaignList]);

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
        return <AssetList campaign={selectedCampaign}
          changeComponent={(nc, params) => updateCurrentComponent(nc, params)} />

      case AdminComponents.AssetAdd:
        return <AssetAdd campaign={selectedCampaign}
          changeComponent={(nc) => updateCurrentComponent(nc)} />

      case AdminComponents.AssetModify:
        return <AssetUpdate campaign={selectedCampaign}
          docLocation={componentParams?.docLocation}
          changeComponent={(nc) => updateCurrentComponent(nc)} />

      case AdminComponents.UserAdd:
        return <UserAdd changeComponent={(nc) => updateCurrentComponent(nc)} />

      case AdminComponents.UserList:
        return <UserList />

      case AdminComponents.CampaignAdd:
        return <CampaignAdd campaignList={campaignList} />

      default:
        return <p>Missing Component!</p>;
    }
  }

  function CampaignList(campaignList: string[]) {
    if (campaignList) {
      return campaignList.map((x: string) => {
        return (
          <CampaignCard campaign={x} key={x} clickHandler={() => {
            setCurrentComponent(AdminComponents.AssetList);
            setSelectedCampaign(x);
            setviewDashboard(false);
          }} />
        )
      });
    }
  }

  return (
    <div className="font-work w-full max-w-7xl px-7">
      <Header backBtn={!viewDashboard} backClickHandler={() => setviewDashboard(true)} />
      {viewDashboard ?
        <>
          <h1 className="font-humane text-9xl text-gray-normal">CAMPAIGNS</h1>
          <div className="pt-10 flex flex-wrap gap-10">
            <CampaignCard create clickHandler={() => {
              setCurrentComponent(AdminComponents.CampaignAdd);
              setviewDashboard(false);
            }} />
            {campaignList === undefined || campaignList?.length === 0 ?
              <CampaignCard noCampaign clickHandler={() => 0} />
              :
              CampaignList(campaignList)
            }
          </div>
        </>
        :
        renderSelectedComponent()
      }
    </div>
  );
}