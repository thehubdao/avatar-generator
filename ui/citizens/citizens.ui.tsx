import { CitizensSections } from "../../enums/citizens/common.enum";
import { IndexFeatureInterface } from "../../interfaces/api.interface";
import { CollectionType } from "../../types/avatar.type";
import { TokenMetadata, Campaign } from "../../types/metadata.type";
import DetailsUI from "./common/details.ui";
import Notifications from "./common/notifications.ui";
import Collection from "./sections/collection.ui";
import LeaderBoard from "./sections/leaderBoard.ui";
import Play from "./sections/play.ui";
import { LeaderboardEntry } from '../../types/leaderboard.type';
import { JsonRpcSigner } from "ethers";

interface CitizensUIProps {
  currentSection: CitizensSections;
  loadedTokens?: TokenMetadata[];
  currentCollection: CollectionType;
  updateCollection: (newCampaign: Campaign, newCombination: string, tokenMetadata: TokenMetadata) => void;
  features?: IndexFeatureInterface[];
  exportModel: () => Promise<void>;
  address: string;
  leaderboardData: LeaderboardEntry[];
  signer: JsonRpcSigner | null;
  handleFollowUser: (address: string) => Promise<void>;
}


export default function CitizensUI({ currentSection,  currentCollection, updateCollection, loadedTokens, features, exportModel, address, leaderboardData, signer, handleFollowUser }: CitizensUIProps) {
  return (
    <>
      {currentSection === CitizensSections.View && (
        <>
          {/* details */}
          {features &&
            <DetailsUI data={features} handleDownload={() => exportModel()} imgUrl={currentCollection.tokenMetadata.imageUrl}/>
          }
          {/* notifications */}
          <Notifications address={address} />
        </>
      )}
      {currentSection === CitizensSections.Collection && loadedTokens && loadedTokens.length > 0 && (
        <>
          <Collection
            loadedTokens={loadedTokens}
            currentCollection={currentCollection}
            updateCollection={updateCollection}
            signer={signer}
          />
        </>
      )}
      {currentSection === CitizensSections.LeaderBoard && (
        <LeaderBoard 
          leaderboardData={leaderboardData} 
          onFollowUser={handleFollowUser}
        />
      )}
      {currentSection === CitizensSections.Play && 
        <Play />
      }
    </>
  );
}
