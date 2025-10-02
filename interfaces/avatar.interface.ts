import { Campaign } from "../types/citizens.type";
import { CitizenMetadata } from "./citizens.interface";

export interface BodyPart {
    name: string;
    path: string;
    thumb: string;
    id: string;
    index: number;
}

export interface CollectionType {
    campaign: Campaign;
    combination: string;
    baseCombination:string;
    citizenMetadata: CitizenMetadata;
  }