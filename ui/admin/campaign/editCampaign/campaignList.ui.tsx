import { useEffect } from "react";
import { PageLocation } from "../../../../enums/common.enum";
import { reset, setName } from "../../../../store/currentCampaignSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { GoToPage } from "../../../../utils/router.util";
import CampaignCard from "./campaignCard.ui";

interface CampaignListUIProps {
  deleteCampaign: (campaign: string) => Promise<void>;
}

export default function CampaignListUI({ deleteCampaign }: CampaignListUIProps) {
  const campaignsList = useAppSelector(state => state.auth.userInfo?.campaign);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(reset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 className="font-humane text-9xl text-gray-normal">CAMPAIGNS</h1>
      <div className="pt-10 flex flex-wrap gap-5">
        <CampaignCard create clickHandler={() => {
          void GoToPage(PageLocation.FirstSteps)
        }} />
        {campaignsList === undefined || campaignsList?.length === 0
          ? <CampaignCard noCampaign clickHandler={() => 0} />
          : campaignsList.map((x) => {
            return (
              <CampaignCard campaign={x} key={x}
                clickHandler={() => {
                  dispatch(setName(x));
                  void GoToPage(PageLocation.AdminCampaign);
                }}
                deleteCampaign={(campaign) => deleteCampaign(campaign)}
              />
            )
          })
        }
      </div>
    </>
  )
}