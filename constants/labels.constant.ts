import { Campaign } from "../enums/citizens/common.enum"

export const FILE_CAMPAIGN_NAME_LABEL: Record<Campaign, string> = {
  vrm_male: 'Lukso_Creator_#',
  vrm_female: 'Lukso_Critizen_#',
  kumi: 'Kumi_Citizen_#',
  root_citizens: 'Root_Citizen_#',
  polygon_citizens: 'Polygon_Citizen_#'
}

export const CAMPAIGN_LABELS = {
  'all': {
    campaignName: 'all',
    nftName: 'Choose Campaign',
    dropdownName: 'All'
  },
  'vrm_female': {
    campaignName: 'vrm_female',
    nftName: 'Lukso Citizen',
    dropdownName: 'Lukso Citizens'
  }, 'vrm_male': { campaignName: 'vrm_male', nftName: 'Lukso Creator', dropdownName: 'Lukso Creators' },
  'kumi': { campaignName: 'kumi', nftName: 'Kumi Citizen', dropdownName: 'Kumi Citizens' },
  'root_citizens': { campaignName: 'root_citizens', nftName: 'Root Citizen', dropdownName: 'Root Citizens' },
  'polygon_citizens': { campaignName: 'polygon_citizens', nftName: 'Polygon Citizen', dropdownName: 'Polygon Citizens' }
}

//NOTE: female campaign has it's types different from the DB
export const CAMPAIGN_UNIVERSAL_PAGE_LABELS = {
  'vrm_female': {
    head: 'hair',
    face: 'accesories',
    legs: 'legs',
    chest: 'chest',
    shoes: 'feet',
    accesories: 'face',
    feet: 'shoes',
    hair: 'head'
  },
  'vrm_male': {
    head: 'head',
    face: 'face',
    legs: 'legs',
    chest: 'chest',
    shoes: 'shoes',
  }
}
