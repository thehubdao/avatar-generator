import { CitizensSections } from "../../enums/citizens/common.enum";
import { IndexFeatureInterface } from "../../interfaces/api.interface";
import { TokenId } from "../../types/metadata.type";
import DetailsUI from "./common/details.ui";
import Notifications from "./common/notifications.ui";
import Collection from "./sections/collection.ui";

interface CitizensUIProps {
  currentSection: CitizensSections;
  tokenIdList?: TokenId[];
  features?: IndexFeatureInterface[];
  exportModel: () => Promise<void>;
}

export default function CitizensUI({ currentSection, tokenIdList, features, exportModel }: CitizensUIProps) {
  return (
    <>
      {
        currentSection === CitizensSections.View &&
        <>
          {/* details */}
          {features &&
            <DetailsUI data={features} handleDownload={() => exportModel()}/>
          }
          {/* notifications */}
          <Notifications />
        </>
      }
      {
        currentSection === CitizensSections.Collection &&
        <>
          <Collection tokenIdList={tokenIdList}/>
        </>
      }
    </>
  )
}