import { LuksoCampaign, SolanaCampaign } from "../enums/citizens/common.enum";
import { Drop } from "../interfaces/citizens.interface";

export type AppCampaigns = LuksoCampaign | SolanaCampaign;

export type CampaignDrops<T extends AppCampaigns> = Record<T, Drop[]>;