import {GetServerSideProps} from "next";
import AvatarCollection from "../../../components/admin/collection.component";
import {GetParameter} from "../../../utils/firebase.util";
import {FirestoreParameters} from "../../../enums/firebase.enum";
import {CampaignParameters} from "../../../interfaces/common.interface";
import {CampaignParameterName, CommonErrorCode} from "../../../enums/common.enum";
import Layout from "../../../layouts/_layout.component.deprecated";
import {Result} from "../../../types/common.type";
import {RemoveUndefinedProperties} from "../../../utils/common.util";

interface AvatarCollectionPageProps {
  isCampaign: boolean;
  campaign: string;
  campaignParams?: CampaignParameters;
}

export default function AvatarCollectionPage({isCampaign, campaign, campaignParams}: AvatarCollectionPageProps) {
  return (
    <>
      { isCampaign ?
        <Layout noCampaign >
          <AvatarCollection campaign={campaign}
                            avatarBasePath={campaignParams?.armature ?? ''}
                            featureList={campaignParams?.features ?? []}
                            defaultAnimation={campaignParams?.config?.defAnimation}
                            skinColor={campaignParams?.config?.skin?.defColor ?? 'FFFFFF'}
                            changeMaterial={campaignParams?.config?.changeMaterial}
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

  const campaignsResult = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaignsResult.success ? campaignsResult.value.some(c => c === leCampaign) : false;

  const campaignParamsResult: Result<CampaignParameters> = isCampaign ?
    await GetParameter<CampaignParameters>(leCampaign, CampaignParameterName.All) :
    {success: false, errMessage: "Not a campaign!", errCode: CommonErrorCode.InternalError};

  const returnProps: AvatarCollectionPageProps = {
    isCampaign,
    campaign: leCampaign,
    campaignParams: campaignParamsResult.success ? campaignParamsResult.value : undefined
  };

  return {
    props: RemoveUndefinedProperties(returnProps)
  };
}