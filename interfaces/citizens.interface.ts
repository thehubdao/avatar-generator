import { Blockchain } from "../enums/blockchain/common.enum";
import { Campaign, HoldingCondition, PaymentType } from "../enums/citizens/common.enum";
import { DropType } from "../enums/lukso/common.enum";
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
  featureIndex: number; //Index of the feature in the campaign
  featureType: string; //Type of the feature, e.g. "body", "face", "head", etc.
  featureName: string; //Name of the feature in the campaign
  description: string;
  imageUrl: string;
  requiredXP: number; //XP required to claim the drop
  paymentType: PaymentType; //Type of payment required to claim the drop
  price: number; //Price of the drop in the payment type
  contractAddress: string;
  holdingCondition?: HoldingCondition; //Condition to be applied to the holdingAddresses
  owned: boolean; //true if the user has already claimed the drop
  claimLimit: number; //Limit on the number of times the drop can be claimed
  claimedAmount: number; //Number of times the drop has been claimed by the user
  isClaimable: boolean; // true if the drop can be claimed by the user
}

export interface DropToClaim {
  wearableIndex: string;
  wearableType: string;
  wearableAddress: string;
  wearablePredictedTokenId: string;
  signature: string;
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

export interface RootMetadata {
  imageUrl: string;
  combination: string;
  baseCombination: string;
  campaign: Campaign;
  collectionId: string;
  tokenId: string;
  attributes: RootDrop[];
}

export interface SolanaAttribute {
  trait_type: string;
  value: string;
  asset_address?: string;
}

export interface LuksoAttribute {
  key: string;
  value: string;
  type: string;
  wearable_address?: string; // Optional, used for features that are linked to an asset
  wearable_token_id?: string;
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
  balance?: number;
  contract_address: string;
  index: number;
  type: string;
  name: string;
  dropType: DropType;
}

export interface LuksoDrop extends Drop {
  tokenId?: string;
  typeIndex: number;
}
export interface LinkableToken {
  tokenId: string;
  parentTokenId?: string;
  parentCollectionId?: string;
  isLinkable: boolean;
}

export interface RootDrop extends Drop {
  schemaPart: string;
  collectionId: string;
  typeIndex: number;
  linkableTokens?: LinkableToken[];
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

export interface MintingPriceData {
  mintPrice?: number;
  mintingPriceSymbol?: string;
}

export interface MintingData {
  mintSupply?: number;
  mintPrice?: MintingPriceData;
  isHolder?: boolean;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AssetLink {
  asset: {
    tokenId: string;
    collectionId: string;
    schema: { name: string };
  };
}

export interface SFTAssetLink {
  tokenId: string;
}