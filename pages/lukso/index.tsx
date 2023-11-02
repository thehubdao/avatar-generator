import { GetServerSideProps } from "next";
import LuksoComponent from "../../components/lukso/lukso.component";
import { GetParameter } from "../../utils/firebase.util";
import { CampaignParameters } from "../../interfaces/common.interface";
import { CampaignParameterName } from "../../enums/common.enum";
import { RemoveUndefinedProperties } from "../../utils/common.util";
import { Client } from "../../enums/client.enum";

interface LuksoAvatarViewProps {
  campaignParams?: CampaignParameters;
}

export default function LuksoAvatarView({ campaignParams }: LuksoAvatarViewProps) {
  return <LuksoComponent campaignParams={campaignParams} />
}

export const getServerSideProps: GetServerSideProps<LuksoAvatarViewProps> = async () => {
  const campaignParameters = await GetParameter<CampaignParameters>(Client.Lukso, CampaignParameterName.All);
  const returnProps: LuksoAvatarViewProps = { campaignParams: campaignParameters, };

  return {
    props: RemoveUndefinedProperties(returnProps)
  };
}