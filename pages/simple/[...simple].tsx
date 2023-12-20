import {GetServerSideProps} from "next";
import {CampaignParameters, FeatureBasic, LookAtVectors} from "../../interfaces/common.interface";
import AvatarSingle from "../../components/avatar/single.component";
import {CastStringToInteger, RemoveUndefinedProperties} from "../../utils/common.util";
import {CampaignParameterName} from "../../enums/common.enum";
import {GetParameter} from "../../utils/firebase.util";
import {FirestoreParameters} from "../../enums/firebase.enum";
import {ChangeMaterialOption} from "../../enums/model.enum";
import {GLOBAL_VALUES} from "../../constants/common.constant";


interface AvatarSimplePageProps {
  campaign: string;
  combination?: number;
  featureList: FeatureBasic[];
  avatarBasePath: string;
  defaultAnimation?: string;
  defaultSkinTone?: string;
  defaultCamPos?: LookAtVectors;
  changeMaterial?: ChangeMaterialOption;
}

export default function AvatarSimplePage({
                                           campaign,
                                           combination,
                                           featureList,
                                           avatarBasePath,
                                           defaultAnimation,
                                           defaultSkinTone,
                                           changeMaterial
                                         }: AvatarSimplePageProps) {
  return (
    <>
      <AvatarSingle campaign={campaign}
                    combination={combination}
                    featureList={featureList}
                    avatarBasePath={avatarBasePath}
                    defaultAnimation={defaultAnimation}
                    defaultSkinTone={defaultSkinTone}
                    changeMaterial={changeMaterial}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AvatarSimplePageProps> = async (context) => {
  const {simple} = context.query;
  const [campaign, combination] = simple as (string | undefined)[];
  
  // if campaign is not campaign throw 404
  if (campaign == undefined) return { notFound: true };

  const campaignsResult = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaignsResult.success ? campaignsResult.value.some(c => c === campaign) : false;
  if (!isCampaign) return { notFound: true };
  
  // Parse combination to number
  const parsedCombination = combination != undefined ? CastStringToInteger(combination) : undefined;
  
  // Get campaign configuration
  const campaignParams = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
  if (!campaignParams.success) return { notFound: true };

  const returnProps: AvatarSimplePageProps = {
    campaign,
    combination: parsedCombination,
    featureList: campaignParams.value.features ?? [],
    avatarBasePath: campaignParams.value.armature ?? GLOBAL_VALUES.AvatarBase,
    defaultAnimation: campaignParams.value.config?.defAnimation,
    defaultSkinTone: campaignParams.value.config?.skin?.defColor,
    defaultCamPos: campaignParams.value.config?.defCam,
    changeMaterial: campaignParams.value.config?.changeMaterial,
  };

  return {
    props: RemoveUndefinedProperties(returnProps),
  };
}