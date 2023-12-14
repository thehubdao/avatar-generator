import {CollectionStatus} from "../enums/collection.enum";

export interface CollectionPostBody {
  campaign?: string;
  update: boolean;
}

export interface CollectionItem {
  id: number;
  indexValues: string;
  status: CollectionStatus;
  chance: number;
}