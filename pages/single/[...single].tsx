import {GetServerSideProps} from "next";
import {CampaignParameters, FeatureBasic, LookAtVectors} from "../../interfaces/common.interface";
import AvatarSingle from "../../components/avatar/single.component";
import {RemoveUndefinedProperties} from "../../utils/common.util";
import {CampaignParameterName} from "../../enums/common.enum";
import {GetParameter} from "../../utils/firebase.util";
import {FirestoreParameters} from "../../enums/firebase.enum";
import {ChangeMaterialOption} from "../../enums/model.enum";
import {GLOBAL_VALUES} from "../../constants/common.constant";

interface AvatarSinglePageProps {
  campaign: string;
  combination?: string;
  featureList: FeatureBasic[];
  avatarBasePath: string;
  defaultAnimation?: string;
  defaultSkinTone?: string;
  defaultCamPos?: LookAtVectors;
  changeMaterial?: ChangeMaterialOption;
}

export default function AvatarSinglePage({
                                           campaign,
                                           combination,
                                           featureList,
                                           avatarBasePath,
                                           defaultAnimation,
                                           defaultSkinTone, 
                                           defaultCamPos,
                                           changeMaterial
                                         }: AvatarSinglePageProps) {
  return (
    <>
      <AvatarSingle campaign={campaign}
                    combinationString={combination}
                    featureList={featureList}
                    avatarBasePath={avatarBasePath}
                    defaultAnimation={defaultAnimation}
                    defaultSkinTone={defaultSkinTone}
                    defaultCameraPosition={defaultCamPos}
                    changeMaterial={changeMaterial}
      />
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
    avatarBasePath: campaignParameters?.armature ?? GLOBAL_VALUES.AvatarBase,
    defaultAnimation: campaignParameters?.config?.defAnimation,
    defaultSkinTone: campaignParameters?.config?.skin?.defColor,
    defaultCamPos: campaignParameters?.config?.defCam,
    changeMaterial: campaignParameters?.config?.changeMaterial
  };

  return {
    props: RemoveUndefinedProperties(returnProps),
  };
}