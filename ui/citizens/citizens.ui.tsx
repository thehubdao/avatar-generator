import { CitizensSections } from "../../enums/citizens/common.enum";
import DetailsUI from "./common/details.ui";
import Notifications from "./common/notifications.ui";
import Collection from "./sections/collection.ui";

interface CitizensUIProps {
  currentSection: CitizensSections;
}

export default function CitizensUI({ currentSection }: CitizensUIProps) {
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
          <Collection />
        </>
      }
    </>
  )
}