import {GetServerSideProps} from "next";
import {CampaignParameterName} from "../enums/common.enum";
import {FirestoreParameters} from "../enums/firebase.enum";
import {BasicData, CampaignParameters} from "../interfaces/common.interface";
import {GetParameter} from "../utils/firebase.util";
import AvatarBuilder from "../components/avatar/builder.component";
import {Base64ToObj, RemoveUndefinedProperties} from "../utils/common.util";
import {EXPORT_ATTRIBUTE, GLOBAL_VALUES} from "../constants/common.constant";

interface AvatarGeneratorProps {
  campaign: string;
  campaignParams?: CampaignParameters;
  attributeConfig?: BasicData[];
  onlyView: boolean;
  bgColor?: string;
  enablePan?: boolean;
}

export default function AvatarGenerator({
                                          campaign,
                                          campaignParams,
                                          attributeConfig,
                                          onlyView,
                                          bgColor, 
                                          enablePan
                                        }: AvatarGeneratorProps) {
  return (<>
    <AvatarBuilder campaign={campaign}
                   avatarBasePath={campaignParams?.armature ?? GLOBAL_VALUES.AvatarBase}
                   campaignConfig={campaignParams?.config ?? {}}
                   selectListFeatures={campaignParams?.features ?? []}
                   selectListAccessories={campaignParams?.accessories ?? []}
                   attributeConfig={attributeConfig}
                   onlyView={onlyView}
                   bgColor={bgColor}
                   enablePan={enablePan}
    />
  </>);
}

export const getServerSideProps: GetServerSideProps<AvatarGeneratorProps> = async (context) => {
  const {builder, config, bg, ov, ep} = context.query;

  let parsedConfig: BasicData[] | undefined = undefined;

  let leCampaign = (builder as string).toLowerCase() ?? GLOBAL_VALUES.BaseCampaign;

  if (config) {
    parsedConfig = Base64ToObj<BasicData[]>(config as string);
    if (parsedConfig && parsedConfig.some(x => x.id === EXPORT_ATTRIBUTE.Campaign)) {
      const configCampaign = parsedConfig.find(x => x.id === EXPORT_ATTRIBUTE.Campaign);
      if (configCampaign)
        leCampaign = configCampaign.val;
    }
  }

  const campaigns = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  const isCampaign = campaigns == undefined ? false : campaigns.some(c => c === leCampaign);

  // TODO: either show base campaign (which is what I'm going to do here) or send user to another page (404 or something)
  if (!isCampaign)
    leCampaign = GLOBAL_VALUES.BaseCampaign;

  const campaignParameters = await GetParameter<CampaignParameters>(leCampaign, CampaignParameterName.All);

  const returnProps: AvatarGeneratorProps = {
    campaign: leCampaign,
    campaignParams: campaignParameters,
    attributeConfig: parsedConfig,
    bgColor: bg != undefined ? bg as string : campaignParameters?.config?.defBg,
    onlyView: ov != undefined ? (ov as string).toLowerCase() === 'true' : false,
    enablePan: ep == undefined ? undefined : (ep as string).toLowerCase() === 't',
  };

  return {
    props: RemoveUndefinedProperties(returnProps)
  };
}