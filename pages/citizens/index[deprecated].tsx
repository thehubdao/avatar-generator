import { useEffect, useState } from "react";
import { Campaign } from "../../types/metadata.type";
import { CampaignParameters } from "../../interfaces/common.interface";
import { GetParameter } from "../../utils/firebase.util";
import { CampaignParameterName, Module } from "../../enums/common.enum";
import { LogError, RemoveUndefinedProperties } from "../../utils/common.util";
import CitizensComponent from "../../components/citizens/citizens.component";
import SnackbarProvider from "../../ui/citizens/snackbar/snackbar.provider";
import { useReadLocalStorage } from "usehooks-ts";

export default function CitizensView() {
  const sessionToken:string | null = useReadLocalStorage('privy:token');
  const [isConnected, setIsConnected] = useState<boolean>();
  const [campaign, setCampaign] = useState<Campaign>()
  const [campaignParams, setCampaignParams] = useState<CampaignParameters>()

  const getCampaignParams = async () => {
    const campaignParameters = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
    console.log('CAMPAIGN PARAMETERS', campaignParameters)
    if (campaignParameters.success) {
      campaignParameters.value.campaign = campaign
      setCampaignParams(RemoveUndefinedProperties(campaignParameters.value))
    } else void LogError(Module.Citizens, 'Error on getting campaign parameters');
  }

  useEffect(() => {
    if (sessionToken !== null) {
      setIsConnected(sessionToken.length > 0);
    } else {
      setIsConnected(false);
    }
  }, [sessionToken])

  useEffect(() => {
    console.log('CAMPAIGN', campaign)
    if (!campaign) return setCampaignParams(undefined)
    void getCampaignParams()
  }, [campaign])

  return <SnackbarProvider>
    <CitizensComponent isLoggedIn={isConnected} campaignParams={campaignParams} setCampaign={(_campaign?: Campaign) => {
      console.log('SET CAMPAIGN', _campaign)
      setCampaign(_campaign)
    }} closeConnection={() => setIsConnected(false)} />
  </SnackbarProvider>
}