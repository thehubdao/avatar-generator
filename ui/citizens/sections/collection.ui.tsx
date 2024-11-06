import { TokenMetadata, Campaign } from "../../../types/metadata.type";
import { CollectionType } from "../../../types/avatar.type";
import CitizensCollection from "../common/citizensCollection.ui";
import WearablesCollection from "../common/wearablesCollection.ui";
import { useState } from "react";
import { CollectionSections } from "../../../enums/citizens/common.enum";
import { BrowserProvider } from "ethers";

interface CollectionProps {
  loadedTokens?: TokenMetadata[];
  currentCollection: CollectionType
  updateCollection: (newCampaign: Campaign, newCombination: string, tokenMetadata: TokenMetadata) => void;
  provider: BrowserProvider | null;
}

export default function Collection({
  loadedTokens,
  updateCollection,
  currentCollection,
  provider
}: CollectionProps) {

  const [selectedList, setSelectedList] = useState<CollectionSections>(CollectionSections.CITIZENS)


  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] py-32">
      <div className="relative container mx-auto">
        <h1 className="font-monument text-white text-6xl text-center">
          { selectedList === CollectionSections.CITIZENS && 'MY CITIZENS' }
          { selectedList === CollectionSections.WEARABLES && 'WEARABLE DROPS' }
        </h1>
        <div className="absolute flex text-white bottom-0 right-0 bg-[#2D2D2D] rounded-full px-px">
          <div className={`px-4 py-2 rounded-full ${selectedList === CollectionSections.CITIZENS ? ' select-none' : ' text-white/60 hover:text-white shadow-citizens-btn bg-citizens-dark cursor-pointer '}`} onClick={() => setSelectedList(CollectionSections.CITIZENS)}>CITIZENS</div>
          <div className={`px-4 py-2 rounded-full ${selectedList === CollectionSections.WEARABLES ? ' select-none' : ' text-white/60 hover:text-white shadow-citizens-btn bg-citizens-dark cursor-pointer '}`} onClick={() => setSelectedList(CollectionSections.WEARABLES)}>WEARABLES</div>
        </div>
      </div>
      {/* MY CITIZENS */}
      {selectedList === CollectionSections.CITIZENS &&
        <CitizensCollection
          tokenList={loadedTokens}
          currentCollection={currentCollection}
          updateCollection={(newCampaign, newCombination, tokenMetadata) => updateCollection(newCampaign, newCombination, tokenMetadata)}
        />
      }
      {/* WEARABLE DROPS */}
      {selectedList === CollectionSections.WEARABLES &&
        <WearablesCollection provider={provider} />}
    </div>
  );
}
