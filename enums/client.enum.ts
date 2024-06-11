

export enum Client {
  Lukso = 'lukso2'
}

export let currentCampaign = 'lukso2'

export const setCurrentCampaign = (campaign: string) => { currentCampaign = campaign }