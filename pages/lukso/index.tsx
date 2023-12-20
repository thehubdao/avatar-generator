import { GetServerSideProps } from "next";
import LuksoComponent from "../../components/lukso/lukso.component";
import { GetParameter } from "../../utils/firebase.util";
import { CampaignParameters } from "../../interfaces/common.interface";
import { CampaignParameterName, Module } from "../../enums/common.enum";
import { LogError, RemoveUndefinedProperties } from "../../utils/common.util";
import {ClientMap} from "../../interfaces/client.interface";
import {FirestoreParameters} from "../../enums/firebase.enum";


interface LuksoAvatarViewProps {
  luksoCampaign: string;
  campaignParams?: CampaignParameters;
}

export default function LuksoAvatarView({ campaignParams, luksoCampaign }: LuksoAvatarViewProps) {
  return <LuksoComponent clientLukso={luksoCampaign}
                         campaignParams={campaignParams} />
}

export const getServerSideProps: GetServerSideProps<LuksoAvatarViewProps> = async () => {
  const clientResult = await GetParameter<ClientMap>(undefined, FirestoreParameters.Clients);
  if (!clientResult.success)
    return {notFound: true};
  
  const campaignParameters = await GetParameter<CampaignParameters>(clientResult.value.lukso, CampaignParameterName.All);
  const returnProps: LuksoAvatarViewProps = {
    luksoCampaign: clientResult.value.lukso,
  };
  
  if (campaignParameters.success) {
    returnProps.campaignParams = campaignParameters.value;
  } else {
    void LogError(Module.Lukso, 'Error on getting campaign parameters');
  }

  return {
    props: RemoveUndefinedProperties(returnProps)
  };
}