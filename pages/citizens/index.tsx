import { useEffect, useState } from "react";
import { Campaign } from "../../types/metadata.type";
import { CampaignParameters } from "../../interfaces/common.interface";
import { GetParameter } from "../../utils/firebase.util";
import { CampaignParameterName, Module } from "../../enums/common.enum";
import { LogError, RemoveUndefinedProperties } from "../../utils/common.util";
import CitizensComponent from "../../components/citizens/citizens.component";

export default function CitizensView() {
  const [campaign, setCampaign] = useState<Campaign>()
  const [campaignParams, setCampaignParams] = useState<CampaignParameters>()

  const getCampaignParams = async () => {
    const campaignParameters = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
    if (campaignParameters.success) {
      campaignParameters.value.campaign = campaign
      setCampaignParams(RemoveUndefinedProperties(campaignParameters.value))
    } else void LogError(Module.Citizens, 'Error on getting campaign parameters');
  }

  useEffect(() => {
    console.log('campaign', campaign);
    if (!campaign) return setCampaignParams(undefined)
    void getCampaignParams()
  }, [campaign])

  return <CitizensComponent campaignParams={campaignParams} setCampaign={(_campaign?: Campaign) => {
    setCampaign(_campaign)
  }} />
}