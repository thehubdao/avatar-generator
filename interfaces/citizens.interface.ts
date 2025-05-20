import { Blockchain } from "../enums/blockchain/common.enum";
import { Campaign, PaymentType } from "../enums/citizens/common.enum";
import { BodyPart } from "./avatar.interface";

export interface CitizensCollection {
  name: string;
  image: string;
  campaign: Campaign;
  blockChain: Blockchain;
}

export interface DataBaseDrop {
  holdingCondition: string;
  holdingAddresses: {
    contractAddress: string;
    tokenName: string;
  }[];
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requiredXP: number;
  paymentType: PaymentType;
  price?: number;
  requiredToken?: string;
  contractAddress: string;
  owned: boolean;
}

export interface Game {
  name: string;
  link: string;
  bgSrc: string;
  iconSrc: string;
  instructions: string[];
  guide?: string;
}

export interface CitizenMetadataImage {
  width: number;
  height: number;
  url: string;
  verification: object | undefined;
}

export interface CitizenMetadata {
  fallbackImageUrl: string;
  imageUrl: string;
  combination: string; // This is the current combination of the citizen, features that are available if the user has balance of them
  baseCombination: string; // This is the base combination of the citizen, features that are always available and linked to the citizen
  campaign: Campaign;
  tokenId: string;
  name: string;
  description: string;
  images: Array<Array<CitizenMetadataImage>>;
  attributes: Array<{ key: string, value: string, type: string }>;
  links?: [];
  assets?: [];
  body: {
    head?: BodyPart;
    face?: BodyPart;
    chest?: BodyPart;
    legs?: BodyPart;
  };
}

export interface CitizenAttribute {
  trait_type: string;
  value: string;
}

export interface TokenId {
  tokenId: string;
  campaign: Campaign;
  metadataUri: string;
}

export interface CampaignWeb3Data {
  contractAddress: string;
  baseCid: string;
}

export interface CampaignData extends Record<Campaign, CampaignWeb3Data> {
}

export interface Drop {
  balance: number;
  contract_address: string;
  index: number;
  type: string;
  name: string;
}

export interface CampaignMetadata extends Record<Campaign, CitizenMetadata[]> { }

export interface FollowUserData {
  followerCount: number;
  followingCount: number;
}

export interface UserXPData {
  xp: number;
  level: number;
  nextLevelXP: number;
}

export interface MintingUiData {
  imgUrl: string;
  avatarDescription: string;
  campaignName: string;
  campaignDescription: string;
  price?: number;
  supply?: number;
}

export interface MintingData {
  mintSupply: number | undefined;
  mintPrice: number | undefined;
}
