import LuksoComponent from "../../components/lukso/lukso.component";
import { GetParameter } from "../../utils/firebase.util";
import { CampaignParameters } from "../../interfaces/common.interface";
import { CampaignParameterName, Module } from "../../enums/common.enum";
import { LogError, RemoveUndefinedProperties } from "../../utils/common.util";
import { useEffect, useState } from "react";
import { Campaign } from "../../types/metadata.type";



export default function LuksoAvatarView() {
  const [campaign, setCampaign] = useState<Campaign>()
  const [campaignParams, setCampaignParams] = useState<CampaignParameters>()

  const getCampaignParams = async () => {
    const campaignParameters = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
    if (campaignParameters.success) {
      campaignParameters.value.campaign = campaign
      console.log(RemoveUndefinedProperties(campaignParameters.value))
      setCampaignParams(RemoveUndefinedProperties(campaignParameters.value))
    } else void LogError(Module.Lukso, 'Error on getting campaign parameters');

  }


  useEffect(() => {
    if (!campaign) return setCampaignParams(undefined)
    void getCampaignParams()
  }, [campaign])
  
  return <LuksoComponent campaignParams={campaignParams} setCampaign={(_campaign: Campaign | undefined) => {
    setCampaign(_campaign)
  }} />
}