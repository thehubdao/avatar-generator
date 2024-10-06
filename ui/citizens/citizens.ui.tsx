import { CitizensSections } from "../../enums/citizens/common.enum";
import { CollectionType } from "../../types/avatar.type";
import { TokenMetadata, Campaign } from "../../types/metadata.type";
import DetailsUI from "./common/details.ui";
import Notifications from "./common/notifications.ui";
import Collection from "./sections/collection.ui";

interface CitizensUIProps {
  currentSection: CitizensSections;
  loadedTokens?: TokenMetadata[];
  currentCollection: CollectionType;
  updateCollection: (newCampaign: Campaign, newCombination: string, tokenMetadata: TokenMetadata) => void;
}

export default function CitizensUI({
  currentSection,
  loadedTokens,
  currentCollection,
  updateCollection
}: CitizensUIProps) {
  return (
    <>
      {currentSection === CitizensSections.View && (
        <>
          {/* details */}
          <DetailsUI />
          {/* notifications */}
          <Notifications />
        </>
      )}
      {currentSection === CitizensSections.Collection && (
        <>
          <Collection
            loadedTokens={loadedTokens}
            currentCollection={currentCollection}
            updateCollection={updateCollection}          />
        </>
      )}
    </>
  );
}