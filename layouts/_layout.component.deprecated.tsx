import { useEffect, useState } from "react";
import { GetCurrentUserInfo, HandleNotLoggedIn } from "../utils/firebase.util";
import { UserInterface } from "../interfaces/firebase.interface";
import AGLoading from "../ui/common/ag-loading.component";

interface LayoutProps {
  children: JSX.Element | JSX.Element[] | boolean;
  userInfo?: UserInterface;
  currentCampaign?: string;
  setUserInfo?: (user?: UserInterface) => void;
  setCurrentCampaign?: (campaign?: string) => void;
  noCampaign?: boolean;
}

export default function Layout({
  setUserInfo,
  // userInfo,
  children
}: LayoutProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function updateUserInfo() {
    const uInfo = await GetCurrentUserInfo();

    setIsLoading(false);
    setUserInfo && setUserInfo(uInfo);
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
      <div className="flex justify-center min-h-screen mt-[88px] pb-16 bg-bg">
        {!isLoading &&
          children
        }
      </div>
      <AGLoading loading={isLoading} />
    </>
  );
}