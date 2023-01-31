import {useEffect, useState} from "react";
import {GetCurrentUserInfo, HandleNotLoggedIn, LogOut} from "../../utils/firebase.util";
import {UserInterface} from "../../interfaces/firebase.interface";
import AGButton from "../common/ag-button.component";
import {UserRoleValues} from "../../enums/firebase.enum";
import {GoToPage} from "../../utils/router.util";
import {PageLocation} from "../../enums/common.enum";
import AGLoading from "../common/ag-loading.component";
import Header from "./header.component";

interface LayoutProps {
  children: JSX.Element | JSX.Element[] | boolean;
  userInfo?: UserInterface;
  currentCampaign?: string;
  setUserInfo: (user?: UserInterface) => void;
  setCurrentCampaign: (campaign?: string) => void;
  noCampaign?: boolean;
}

export default function Layout({
                                 setUserInfo,
                                 userInfo,
                                 noCampaign,
                                 currentCampaign,
                                 setCurrentCampaign,
                                 children
                               }: LayoutProps) {
  const [loading, setLoading] = useState<boolean>(true);

  async function updateUserInfo() {
    const uInfo = await GetCurrentUserInfo();

    // if (uInfo?.campaign == undefined || uInfo?.campaign?.length == 0)
    //   await GoToPage(PageLocation.FirstSteps);

    setLoading(false);
    setUserInfo(uInfo);
  }
  
  useEffect(() => {
    const componentDidMount = async () => {
      const isNotLogIn = await HandleNotLoggedIn();
      if (isNotLogIn)
        return;

      await updateUserInfo();
    };

    componentDidMount()
      .catch(err => console.error(err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderCampaignOptions() {
    if (!(userInfo && userInfo.campaign?.length > 0))
      return <></>;

    return userInfo.campaign.map(campaign => {
      return <option value={campaign} key={`key_${campaign}`}>{campaign}</option>
    });
  }

  return (
    <>
      <AGLoading loading={loading} transparency />
      <Header />
      { !loading &&
        children
      }
      <div className="bg-emerald-500 flex justify-between hidden">
        <div className="ml-3 mr-1 my-2 flex">
          {userInfo &&
              <div className="my-auto flex flex-col sm:flex-row">
                  <p className="font-bold">{userInfo.name}</p>
                  <p className="ml-2">
                      <span>🧔‍♀️: </span>{userInfo.account}
                  </p>
                  <p className="ml-2">
                      <span>👨‍🌾: </span>{userInfo.role != undefined ? UserRoleValues[userInfo.role] : 'missing'}
                  </p>
                {!noCampaign &&
                    <div className="ml-2 flex">
                        <p>🚩:</p>
                        <select className="ml-1" defaultValue={currentCampaign}
                                onChange={e => setCurrentCampaign(e.target.value)}>
                            <option value=''>Select...</option>
                          {renderCampaignOptions()}
                        </select>
                    </div>
                }
              </div>
          }
        </div>
        <AGButton type="danger" onClickEvent={() => void LogOut()}>Log Out</AGButton>
      </div>
      
    </>
  );
}