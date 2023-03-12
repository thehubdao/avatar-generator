import { useEffect, useState } from "react";
import { UserRoleValues } from "../../enums/firebase.enum";
import { AdminComponents } from "../../enums/common.enum";
import { AdminComponentParams } from "../../interfaces/common.interface";

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

// Icons
import { AiOutlineLink } from 'react-icons/ai';
import Header from "./header.component";

//#endregion Components

interface DashboardProps {
  children?: JSX.Element | JSX.Element[];
  userRole?: UserRoleValues;
  campaignList?: string[];
}

interface CardProps {
  noCampaign?: boolean;
  create?: boolean;
  campaign?: string;
  clickHandler: () => void;
}

function Card({ noCampaign, create, campaign, clickHandler }: CardProps) {
  return (
    <div className="rounded-2xl h-96 w-72 flex flex-col justify-center items-center shadow-flat-soft hover:shadow-flat-hard overflow-hidden">
      {noCampaign &&
        <>
          <h2 className="text-center font-bold leading-none text-gray-normal">YOU DON&apos;T<br />HAVE A CAMPAIGN</h2>
        </>
      }
      {create &&
        <>
          <h2 className="text-center font-bold leading-none text-gray-normal">CREATE A<br />NEW CAMPAIGN</h2>
          <div>
            <div className="relative rounded-full border border-gray-light w-32 h-32 my-4">
              <div className="absolute w-3/5 h-[2px] bg-gray-light top-2/4 left-2/4 -translate-x-2/4"></div>
              <div className="absolute h-3/5 w-[2px] bg-gray-light top-2/4 left-2/4 -translate-y-2/4"></div>
            </div>
          </div>
          <AGButton nm onClickEvent={() => void clickHandler()} >
            CREATE
          </AGButton>
        </>
      }
      {campaign &&
        <>
          <div className="w-full h-full bg-gray-dark p-2 flex flex-col justify-between">
            <div className="bg-bg w-fit px-5 py-2 rounded-xl flex justify-between items-center gap-6">
              <p className="uppercase font-bold text-gray-normal">{campaign}</p>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="bg-bg w-fit px-5 rounded-full" onClick={() => void clickHandler()}>
                <p className="py-1">EDIT</p>
              </button>
              <div className="bg-bg w-fit px-2 rounded-full flex justify-between items-center">
                <AiOutlineLink />
              </div>
            </div>
          </div>
        </>
      }
    </div>
  )
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
          <Card campaign={x} key={x} clickHandler={() => {
            setCurrentComponent(AdminComponents.AssetList);
            setSelectedCampaign(x);
            setviewDashboard(false);
          }} />
        )
      });
    }
  }

  return (
    <div>
      <Header backBtn={!viewDashboard} backClickHandler={() => setviewDashboard(true)}/>
      {viewDashboard ?
        <>
          <h1 className="font-humane text-9xl text-gray-normal">CAMPAIGNS</h1>
          <div className="pt-10 flex gap-10">
            {campaignList === undefined || campaignList?.length === 0 ?
              <Card noCampaign clickHandler={() => 0} />
              :
              CampaignList(campaignList)
            }
            <Card create clickHandler={() => {
              setCurrentComponent(AdminComponents.CampaignAdd);
              setviewDashboard(false);
            }} />
          </div>
        </>
        :
        renderSelectedComponent()
      }
    </div>
  );
}