import {GetServerSideProps} from "next";
import {BasicData, CampaignParameters, LookAtVectors} from "../../interfaces/common.interface";
import AvatarSingle from "../../components/avatar/single.component";
import {RemoveUndefinedProperties} from "../../utils/common.util";
import {CampaignParameterName, GlobalValues} from "../../enums/common.enum";
import {GetParameter} from "../../utils/firebase.util";
import {FirestoreParameters} from "../../enums/firebase.enum";

interface AvatarSinglePageProps {
  campaign: string;
  combination?: string;
  featureList: BasicData[];
  avatarBasePath: string;
  defaultAnimation?: string;
  defaultSkinTone?: string;
  defaultCamPos?: LookAtVectors;
}

export default function AvatarSinglePage({
                                           campaign,
                                           combination,
                                           featureList,
                                           avatarBasePath,
                                           defaultAnimation,
                                           defaultSkinTone
                                         }: AvatarSinglePageProps) {
  return (
    <>
      <AvatarSingle campaign={campaign}
                    combinationString={combination}
                    featureList={featureList}
                    avatarBasePath={avatarBasePath}
                    defaultAnimation={defaultAnimation}
                    defaultSkinTone={defaultSkinTone} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AvatarSinglePageProps> = async (context) => {
  const {single} = context.query;
  const [campaign, combination] = single as (string | undefined)[];
  
  // if campaign is not campaign throw 404
  if (campaign == undefined) return { notFound: true };

  const campaigns = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaigns == undefined ? false : campaigns.some(c => c === campaign);
  if (!isCampaign) return { notFound: true };

  // Get campaign configuration
  const campaignParameters = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);

  const returnProps: AvatarSinglePageProps = {
    campaign,
    combination,
    featureList: campaignParameters?.features ?? [],
    avatarBasePath: campaignParameters?.armature ?? GlobalValues.AvatarBase,
    defaultAnimation: campaignParameters?.config?.defAnimation,
    defaultSkinTone: campaignParameters?.config?.defSkinColor,
    defaultCamPos: campaignParameters?.config?.defCam,
  };

  return {
    props: RemoveUndefinedProperties(returnProps),
  };
}