import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse, CollectionDataInterface, CollectionDataProcess} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";
import {GetParameter} from "../../../utils/firebase.util";
import {FirestoreParameters} from "../../../enums/firebase.enum";
import {FindAndReadjustFeatureIndexes, GetMaxCombinationNum, GetMaxIndexValues} from "../../../utils/collection.util";
import {LogError} from "../../../utils/common.util";
import {Module} from "../../../enums/common.enum";
import {GLOBAL_VALUES} from "../../../constants/common.constant";
import {CollectionPostBody} from "../../interfaces/collection.interface";

export async function GetUriApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<CollectionDataInterface>>) {
  const {collection} = req.query;
  const [campaign] = collection as string[];
  
  try {
    // On campaign not exist return bad request
    const isCampaign = await CheckCampaign(campaign);
    if (!isCampaign)
      return RequestResponse(res, "BadRequest", false, DefaultApiResponse.WrongInput);

    // Update index on campaign
    const featureValues = await FindAndReadjustFeatureIndexes(campaign);
    if (featureValues == undefined)
      return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
    
    const maxIndexValues = GetMaxIndexValues(featureValues.featureList, featureValues.featureOptionListData);
    const maxCombination = GetMaxCombinationNum(maxIndexValues);

    const collectionData: CollectionDataInterface = {
      maxCombination: maxCombination,
      maxIndex: Array.from(maxIndexValues.values()).join(GLOBAL_VALUES.CollectorIndexSeparator),
      featureIndex: featureValues.featureList.map(f => { return { index: f.index, name: f.displayName }})
    };

    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, collectionData);
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, err.message, e);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}

async function CheckCampaign(campaign: string | undefined) {
  if (campaign == undefined) return false;
  
  const campaignsResult = await GetParameter<string[]>(undefined, FirestoreParameters.Campaigns);
  return campaignsResult.success ? campaignsResult.value.some(c => c === campaign) : false;
}

async function ProcessCollection(campaign: string, update: boolean, processId: number) {
  // Check existence of collection
  
  // If it exists dont do anything, unless update is true
  
  // Count the amount of docs
  // If same amount of maxCombination, all good
  
  // If different? update the existence
  // Separate the minted ones from the others
  
  // If no minted ones, just refill to the same amount of existence with new index-values
  // If minted ones, recalculate based on the index-values
  // and update the minted state
  
  // When done, fill on db the status and tell is done
  // Create something that controls this status
}

export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<CollectionDataProcess>>) {
  const {update, campaign} = req.body as CollectionPostBody;
  
  try {
    const isCampaign = await CheckCampaign(campaign);
    if (!isCampaign)
      return RequestResponse(res, "BadRequest", false, DefaultApiResponse.MissingInfo);
    
    
    
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ApiUtil, err.message, e);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}

// Call the util that does things
// Start with code and singleton that saves this code on db
// On process done update the status of the code on db
// Make status api call that returns how that code is handling
// Status code can be an UID
// Either check if request stack, or replace each other
// Create queue system for this request


// Process
// Fill the db in some place (collection/<campaign>/nft/<doc-id>
// doc-id should be the combination number
// schema
//   id: same doc-id
//   status: minted | waiting
//   indexValues: string - Array of index values that create this combination
//   percentage: number - based on how likable to hit this combination can be (based on tier of features)

// GetRandomNft (change name something more likeable)
// Gets one random from the list that is on status waiting
// Generate random number, check with percentage if it hits return this 
// If the chance doesn't hit, re roll random number and check with another item
// return the id and index-values of the winner

// Util on LuksoBackend
// Allow to update this combination status to minted when a mint happens
// that way we keep track of minted combinations and won't show any combination that is already taken