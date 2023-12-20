import {CollectionStatus} from "../enums/collection.enum";

export interface CollectionPostBody {
  campaign?: string;
  isUpdate?: boolean;
}

export interface CollectionItem {
  id: number;
  status?: CollectionStatus;
  indexValues?: string;
  chance?: number;
  factor?: number;
}