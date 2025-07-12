export enum CitizensSections {
  View,
  Collection,
  LeaderBoard,
  Play,
  Mint
}

export enum CitizensPageLocation {
  HOME = '/citizens',
  BACKPACK = '/citizens/backpack',
  LEADERBOARD = '/citizens/leaderboard',
  PLAY = '/citizens/play',
}

export enum CollectionSections {
  CITIZENS,
  WEARABLES
}

export enum TheHubSocialLinks {
  SocialX = 'https://x.com/thehub_dao',
  SocialInstagram = 'https://www.instagram.com/thehub_dao/',
  Discord = 'https://discord.gg/3KvUpQayxp',
  Telegram = 'https://t.me/+nwDvGtb1iT4zNjY6',
  CommonGround = 'https://app.cg/c/thehub/'
}

export enum BackedByLinks {
  Polygon = 'https://polygonscan.com/',
  Sandbox = 'https://www.sandbox.game/en/',
  Decentraland = 'https://decentraland.org/',
  Chainlink = 'https://chain.link/',
  Brinc = 'https://www.brinc.io/',
  Ocean = 'https://app.oceanportocol.xyz/en/?utm_source=bing_original_site=successfully&utm_source=bing&utm_medium=cpc&utm_term=trading_platforms#'
}

export enum CardSize {
  Small,
  Medium,
  Large,
  Big
}

export enum PaymentType {
  LYX = "LYX",
  SOL = "SOL",
  ETH = "ETH"
}

export enum HoldingCondition {
  HAS_ANY = "|", //Means the user needs to be holding any of the tokens
  HAS_ALL = "&" //Means the user needs to be holding all the tokens
}

export enum Campaign {
  Citizens = "vrm_female",
  Creators = "vrm_male",
  Kumi = "kumi",
  Based = "root_citizens",
  Polygon = "polygon_citizens"
}

export enum LuksoCampaign {
  Citizens = Campaign.Citizens,
  Creators = Campaign.Creators,
}

export enum SolanaCampaign {
  Kumi = Campaign.Kumi,
}

export enum RootCampaign {
  Based = "root_citizens",
}

export enum CandyMachineGroup {
  Holder = "holder",
  Public = "public",
}

export enum CampaignBaseCombination { 
  Citizens = "0-0-0-0-0",
  Creators = "0-0-0-0-0",
  Kumi = "0-0-0-0-0-0-0-0-0-0",
  Based = "0-0-0-0-0-0-0",
}

export enum CampaignBaseUrl {
  Citizens = "",
  Creators = "",
  Kumi = "",
  Based = "https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/root_citizens%2Fthumb%2Fimagen_2025-05-28_110559759.png?alt=media&token=79f77a75-62d0-4053-944f-afc10ee5330f",
}
