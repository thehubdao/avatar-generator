import {useEffect, useState} from "react";
import {GetCurrentUserInfo, HandleNotLoggedIn} from "../../utils/firebase.util";
import {UserInterface} from "../../interfaces/firebase.interface";
import AGLoading from "../common/ag-loading.component";

interface LayoutProps {
  children: JSX.Element | JSX.Element[] | boolean;
  userInfo?: UserInterface;
  setUserInfo: (user?: UserInterface) => void;
}

export default function Layout({
                                 setUserInfo,
                                 userInfo,
                                 children
                               }: LayoutProps) {
  const [loading, setLoading] = useState<boolean>(true);

  async function updateUserInfo() {
    const uInfo = await GetCurrentUserInfo();

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

  // function renderCampaignOptions() {
  //   if (!(userInfo && userInfo.campaign?.length > 0))
  //     return <></>;

  //   return userInfo.campaign.map(campaign => {
  //     return <option value={campaign} key={`key_${campaign}`}>{campaign}</option>
  //   });
  // }

  return (
    <>
      <AGLoading loading={loading} transparency />
      <div className="min-h-screen pt-[88px] px-5 bg-bg">
        { !loading &&
          children
        }
      </div>
    </>
  );
}