import {useEffect} from "react";
import {GetInfoDB, HandleNotLoggedIn, UpdateDocObject} from "../../../utils/firebase.util";
import {FirestoreGlobalLocation} from "../../../enums/firebase.enum";
import {RemoveUndefinedProperties} from "../../../utils/common.util";
import {CampaignParameters, FeatureBasic, Result} from "../../../interfaces/common.interface";

interface TemporaryType {
  id: string;         // Id is almost always used as a way to find documents on a collection
  val: string;
}

export default function UpInfoPage() {
  // Set dbLocation you want to modify
  const dbLocation = 'campaign/base_1' as
    FirestoreGlobalLocation;
  
  async function onInit() {
    // Identifies if dbLocation refers to a collection or a document
    const isDoc = dbLocation.split('/').length % 2 === 0;
    console.log(isDoc);
    
    // Get infoDb
    const infoDb = await GetInfoDB<CampaignParameters>(dbLocation);
    const realCampaign = infoDb.at(0);
    
    if (realCampaign?.features == undefined) return;
    
    const changes: Partial<CampaignParameters> = {features: []};
    for (const feature of realCampaign.features as any) {
      changes.features?.push({...feature,
        meshName: feature.id,
        displayName: feature.val
      });
    }

    const result = await UpdateDocObject(dbLocation, RemoveUndefinedProperties(changes));
    console.log(result)

    // Iterate all the data collected on db
    // for (const oldDatum  of array) {
    //   console.log(oldDatum)
    //   // Send to new type (whatever type you want) (IFrameInBound is just an example) (the re-mapping needs to be done manually)
    //   const newDatum: Partial<FeatureBasic> = {
    //     meshName: oldDatum.id,
    //     displayName: oldDatum.val
    //   };
    //  
    //   let result: Result<boolean> = {success: true, value: true};
    //  
    //   // Send the new data to update the document
    //   result = await UpdateDocObject(dbLocation, RemoveUndefinedProperties(newDatum),
    //     undefined, isDoc ? undefined : oldDatum.id);
    //  
    //   // await ReplaceDoc(dbLocation + (isDoc ? '': `/${oldDatum.id}`),
    //   //   JSON.stringify(RemoveUndefinedProperties(newDatum)));
    //   console.log(result);
    // }
  }

  useEffect(() => {
    (async () => {
      const isNotLogIn = await HandleNotLoggedIn();
      if (isNotLogIn)
        return;
      
      await onInit();
    })().catch(err => console.error(err));
  }, []);
  
  return (
    <>
      <h1>Hello NaN!</h1>
    </>
  )
}