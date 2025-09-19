import { LuksoCampaign, PolygonCampaign, RootCampaign, SolanaCampaign } from "../enums/citizens/common.enum";
import { Drop } from "../interfaces/citizens.interface";

export type AppCampaigns = LuksoCampaign | SolanaCampaign | RootCampaign | PolygonCampaign;

export type CampaignDrops<T extends AppCampaigns> = Record<T, Drop[]>;