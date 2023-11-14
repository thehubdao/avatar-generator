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

  const campaignsResult = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaignsResult.success ? campaignsResult.value.some(c => c === campaign) : false;
  if (!isCampaign) return { notFound: true };

  // Get campaign configuration
  const campaignParamsResult = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
  if (!campaignParamsResult.success) return { notFound: true };

  const returnProps: AvatarSinglePageProps = {
    campaign,
    combination,
    featureList: campaignParamsResult.value.features ?? [],
    avatarBasePath: campaignParamsResult.value.armature ?? GLOBAL_VALUES.AvatarBase,
    defaultAnimation: campaignParamsResult.value.config?.defAnimation,
    defaultSkinTone: campaignParamsResult.value.config?.skin?.defColor,
    defaultCamPos: campaignParamsResult.value.config?.defCam,
    changeMaterial: campaignParamsResult.value.config?.changeMaterial
  };

  return {
    props: RemoveUndefinedProperties(returnProps),
  };
}