import {useEffect} from "react";
import {GetInfoDB, HandleNotLoggedIn, InsertDocWithId} from "../../../utils/firebase.util";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {LogError} from "../../../utils/common.util";

export default function DuplicatePage() {
  useEffect(() => {
    (async () => {
      const isNotLogIn = await HandleNotLoggedIn();
      if (isNotLogIn)
        return;

      // await onInit();
    })().catch(err => console.error(err));
  }, []);

  async function onInit() {
    // Set dbLocation you want to modify
    const originCampaign = 'campaign/base_1';
    const destCampaign = 'general/backup/campaign/base_1';
    
    await DuplicateCampaign(originCampaign, destCampaign);
  }
  
  async function DuplicateCampaign(start: string, dest: string) {
    const splitData = dest.split('/');
    if (splitData.length % 2 != 0)
      return LogError("DuplicateUtil", "Is not a valid campaign location!");
    
    const docName = splitData.slice(-1)[0];
    const destLoc = splitData.slice(0, -1).join('/');
    
    // Duplicate campaign info
    const [campaignInfo] = await GetInfoDB(start);
    
    const resultCampaignDoc = await InsertDocWithId(docName, campaignInfo, destLoc as FirestoreLocation);
    
    // Duplicate features
    await DuplicateCollection(start, dest, FirestoreLocation.Features);
    // Duplicate accessories
    // await DuplicateCollection(start, dest, FirestoreLocation.Accessories);
    // Duplicate animations
    // await DuplicateCollection(start, dest, FirestoreLocation.Animations);
    // Duplicate stages
    // await DuplicateCollection(start, dest, FirestoreLocation.Stages);
    // Duplicate env_maps
    // await DuplicateCollection(start, dest, FirestoreLocation.EnvMaps);
  }
  
  interface FakeId {
    id: string;
  }
  
  async function DuplicateCollection(og: string, dest: string, collectionName: string | FirestoreLocation) {
    const allDocs = await GetInfoDB<FakeId>(`${og}/${collectionName}`);
    
    for (const doc of allDocs) {
      const resultDoc = await InsertDocWithId(doc.id, doc, `${dest}/${collectionName}` as FirestoreLocation);
      if (!resultDoc.success)
        await LogError("DuplicateUtil", resultDoc.errMessage as string);
    }
    
    console.log(`Done duplicating "${collectionName}"`);
  }

  return (
    <>
      <h1>Hello NaN!</h1>
    </>
  )
}