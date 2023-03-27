import {GetServerSideProps} from "next";
import AvatarCollection from "../../../components/admin/collection.component";
import {GetParameter} from "../../../utils/firebase.util";
import {FirestoreParameters} from "../../../enums/firebase.enum";
import {CampaignParameters} from "../../../interfaces/common.interface";
import {CampaignParameterName} from "../../../enums/common.enum";
import Layout from "../../../components/admin/_layout.component";

interface AvatarCollectionPageProps {
  isCampaign: boolean;
  campaign: string;
  campaignParams: CampaignParameters | null;
}

export default function AvatarCollectionPage({isCampaign, campaign, campaignParams}: AvatarCollectionPageProps) {
  return (
    <>
      { isCampaign ?
        <Layout setUserInfo={() => {}}
                noCampaign
                setCurrentCampaign={() => {}} >
          <AvatarCollection campaign={campaign}
                            avatarBasePath={campaignParams?.armature ?? ''}
                            featureList={campaignParams?.features ?? []}
                            defaultAnimation={campaignParams?.config?.defAnimation}
                            skinColor={campaignParams?.config?.defSkinColor ?? 'F2A47E'}
          />
        </Layout>
        :
        <h1>Is not a Campaign</h1>
      }
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AvatarCollectionPageProps> = async (context) => {
  const {collection} = context.query;

  const leCampaign = collection as string;

  const campaigns = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaigns == undefined ? false : campaigns.some(c => c === leCampaign);
  
  let campaignParameters: CampaignParameters | undefined = undefined;

  if(isCampaign)
    campaignParameters = await GetParameter<CampaignParameters>(leCampaign, CampaignParameterName.All);

  const returnProps: AvatarCollectionPageProps = {
    isCampaign,
    campaign: leCampaign,
    campaignParams: campaignParameters ?? null
  };

  return {
    props: returnProps
  };
}