import { Blockchain } from "../enums/blockchain/common.enum";
import { Campaign, HoldingCondition, PaymentType } from "../enums/citizens/common.enum";
import { BodyPart } from "./avatar.interface";

export interface CitizensCollection {
  name: string;
  image: string;
  campaign: Campaign;
  blockChain: Blockchain;
  active: boolean;
}

export interface ClaimableDrop {
  holdingAddresses: {
    contractAddress: string;
    tokenName: string; //This is the name of the collection that the user needs to be holding
  }[]; //If this array is not empty, means the user needs to be holding
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requiredXP: number; //XP required to claim the drop
  paymentType: PaymentType; //Type of payment required to claim the drop
  price: number; //Price of the drop in the payment type
  contractAddress: string;
  holdingCondition?: HoldingCondition; //Condition to be applied to the holdingAddresses
  owned: boolean; //true if the user has already claimed the drop
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
  rawMetadata: SolanaMetadata | LuksoMetadata | RootMetadata;
}

export interface LuksoMetadata {
  fallbackImageUrl: string;
  imageUrl: string;
  combination: string; 
  baseCombination: string;
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

export interface SolanaMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<SolanaAttribute>;
  properties: {
    files: Array<{ uri: string, type: string }>;
    category: string;
  };
  combination: string;
  baseCombination: string;
  vrm_url: string;
  asset_address: string;
}

export interface RootMetadata{
  imageUrl: string;
  combination: string;
  baseCombination: string;
  campaign: Campaign;
  collectionId: string;
  tokenId: string;
}

export interface SolanaAttribute {
  trait_type: string;
  value: string;
  asset_address?: string;
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

export interface RootDrop extends Drop {
  schemaPart: string;
  tokenId: string;
  collectionId: string;
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
  mintSupply?: number;
  mintPrice?: number;
  isHolder?: boolean;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}