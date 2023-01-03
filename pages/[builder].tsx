import {GetServerSideProps} from "next";
import {CampaignParameterName, ExportAttributeValues, GlobalValues} from "../enums/common.enum";
import {FirestoreParameters} from "../enums/firebase.enum";
import {BasicData, CampaignParameters} from "../interfaces/common.interface";
import {GetParameter} from "../utils/firebase.util";
import AvatarEditor from "../components/avatar/editor.component";
import {Base64ToObj} from "../utils/common.util";

interface AvatarGeneratorProps {
  campaign: string;
  campaignParams: CampaignParameters | null;
  attributeConfig: BasicData[] | null;
  onlyView: boolean;
  bgColor?: string;
}

export default function AvatarGenerator({
                                          campaign,
                                          campaignParams,
                                          attributeConfig,
                                          onlyView,
                                          bgColor,
                                        }: AvatarGeneratorProps) {
  return (<>
    <AvatarEditor campaign={campaign}
                  avatarBasePath={campaignParams?.armature ?? ''}
                  campaignConfig={campaignParams?.config ?? {}}
                  selectListFeatures={campaignParams?.features ?? []}
                  selectListAccessories={campaignParams?.accessories ?? []}
                  attributeConfig={attributeConfig}
                  onlyView={onlyView}
                  bgColor={bgColor}
    />
  </>);
}

export const getServerSideProps: GetServerSideProps<AvatarGeneratorProps> = async (context) => {
  const {builder, config, bg, ov} = context.query;
  
  let parsedConfig: BasicData[] | null = null;
  
  let leCampaign = (builder as string).toLowerCase() ?? GlobalValues.BaseCampaign;

  if (config) {
    parsedConfig = Base64ToObj<BasicData[]>(config as string);
    if (parsedConfig && parsedConfig.some(x => x.id === ExportAttributeValues.Campaign)) {
      const configCampaign = parsedConfig.find(x => x.id === ExportAttributeValues.Campaign);
      if (configCampaign)
        leCampaign = configCampaign.val;
    }
  }

  const campaigns = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaigns == undefined ? false : campaigns.some(c => c === leCampaign);
  
  // TODO: either show base campaign (which is what I'm going to do here) or send user to another page (404 or something)
  if(!isCampaign)
    leCampaign = GlobalValues.BaseCampaign;
  
  const campaignParameters = await GetParameter<CampaignParameters>(leCampaign, CampaignParameterName.All);
  
  const returnProps: AvatarGeneratorProps = {
    campaign: leCampaign,
    campaignParams: campaignParameters ?? null,
    attributeConfig: parsedConfig,
    bgColor: bg as string ?? null,
    onlyView: ov != undefined ? (ov as string).toLowerCase() === 'true' : false,
  };
  
  return {
    props: returnProps
  };
}