import { PaymentType } from "../enums/citizens/common.enum";
import { Campaign } from "../types/metadata.type";

export interface CitizensCollection {
  name: string;
  image: string;
  campaign: Campaign;
}

export interface DataBaseDrop {
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