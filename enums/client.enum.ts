

export enum Client {
  Lukso = 'vrm_male'
}

export let currentCampaign = 'vrm_male'

export const setCurrentCampaign = (campaign: string) => { currentCampaign = campaign }