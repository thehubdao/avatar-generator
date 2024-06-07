

export enum Client {
  Lukso = 'VRM_MALE'
}

export let currentCampaign = 'VRM_MALE'

export const setCurrentCampaign = (campaign: string) => { currentCampaign = campaign }