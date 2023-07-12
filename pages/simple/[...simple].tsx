import {GetServerSideProps} from "next";
import {CampaignParameters, FeatureBasic, LookAtVectors} from "../../interfaces/common.interface";
import AvatarSingle from "../../components/avatar/single.component";
import {CastStringToInteger, RemoveUndefinedProperties} from "../../utils/common.util";
import {CampaignParameterName, GlobalValues} from "../../enums/common.enum";
import {GetParameter} from "../../utils/firebase.util";
import {FirestoreParameters} from "../../enums/firebase.enum";
import {ChangeMaterialOption} from "../../enums/model.enum";


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

  const campaigns = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaigns == undefined ? false : campaigns.some(c => c === campaign);
  if (!isCampaign) return { notFound: true };
  
  // Parse combination to number
  const parsedCombination = combination != undefined ? CastStringToInteger(combination) : undefined;
  
  // Get campaign configuration
  const campaignParameters = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);

  const returnProps: AvatarSimplePageProps = {
    campaign,
    combination: parsedCombination,
    featureList: campaignParameters?.features ?? [],
    avatarBasePath: campaignParameters?.armature ?? GlobalValues.AvatarBase,
    defaultAnimation: campaignParameters?.config?.defAnimation,
    defaultSkinTone: campaignParameters?.config?.skin?.defColor,
    defaultCamPos: campaignParameters?.config?.defCam,
    changeMaterial: campaignParameters?.config?.changeMaterial,
  };

  return {
    props: RemoveUndefinedProperties(returnProps),
  };
}