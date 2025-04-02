import { Blockchain } from "../enums/blockchain/common.enum";
import { Campaign, PaymentType } from "../enums/citizens/common.enum";
import { BodyPart } from "../types/avatar.type";

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

export interface TokenMetadataImage {
  width: number;
  height: number;
  url: string;
  verification: object | undefined;
}

export interface CitizenMetadata {
  fallbackImageUrl: string;
  imageUrl: string;
  combination: string;
  baseCombination: string;
  campaign: Campaign;
  tokenId: string;
  name: string;
  description: string;
  images: Array<Array<TokenMetadataImage>>;
  attributes?: Array<{ key: string, value: string, type: string }>;
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
