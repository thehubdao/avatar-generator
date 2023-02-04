import {GetServerSideProps} from "next";
import AvatarCollection from "../../../components/admin/collection.component";
import {GetParameter} from "../../../utils/firebase.util";
import {FirestoreParameters} from "../../../enums/firebase.enum";
import {CampaignParameters} from "../../../interfaces/common.interface";
import {CampaignParameterName} from "../../../enums/common.enum";
import {useEffect} from "react";
import Layout from "../../../components/admin/_layout.component";

interface AvatarCollectionPageProps {
  isCampaign: boolean;
  campaign: string;
  campaignParams: CampaignParameters | null;
  start: string | undefined;
  end: string | undefined;
  single: string | undefined;
}

export default function AvatarCollectionPage({isCampaign, campaign, campaignParams, start, end, single}: AvatarCollectionPageProps) {
  useEffect(() => {
    console.log('Page', isCampaign, campaign, campaignParams, start, end, single);
  }, []);
  
  return (
    <>
      { isCampaign ?
        <Layout setUserInfo={() => {}}
                noCampaign
                setCurrentCampaign={() => {}} >
          <AvatarCollection start={start}
                            end={end}
                            single={single}
                            campaign={campaign}
                            avatarBasePath={campaignParams?.armature ?? ''}
                            featureList={campaignParams?.features ?? []}
                            defaultAnimation={campaignParams?.config?.defAnimation}
                            skinColor={campaignParams?.config?.defSkinColor ?? '00ffff'}
          />
        </Layout>
        :
        <h1>Is not a Campaign</h1>
      }
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AvatarCollectionPageProps> = async (context) => {
  const {collection, start, end, single} = context.query;

  const leCampaign = collection as string;

  const campaigns = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaigns == undefined ? false : campaigns.some(c => c === leCampaign);
  
  let campaignParameters: CampaignParameters | undefined = undefined;

  if(isCampaign)
    campaignParameters = await GetParameter<CampaignParameters>(leCampaign, CampaignParameterName.All);

  const returnProps: AvatarCollectionPageProps = {
    isCampaign,
    campaign: leCampaign,
    campaignParams: campaignParameters ?? null,
    start: start as string ?? null,
    end: end as string ?? null,
    single: single as string ?? null,
  };

  return {
    props: returnProps
  };
}