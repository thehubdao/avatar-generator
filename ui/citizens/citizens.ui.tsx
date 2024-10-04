import { CitizensSections } from "../../enums/citizens/common.enum";
import { TokenId } from "../../types/metadata.type";
import DetailsUI from "./common/details.ui";
import Notifications from "./common/notifications.ui";
import Collection from "./sections/collection.ui";

interface CitizensUIProps {
  currentSection: CitizensSections;
  tokenIdList?: TokenId[];
}

export default function CitizensUI({ currentSection, tokenIdList }: CitizensUIProps) {
  return (
    <>
      {
        currentSection === CitizensSections.View &&
        <>
          {/* details */}
          <DetailsUI />
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