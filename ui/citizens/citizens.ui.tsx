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
import Modal from "./common/modal.ui";
import Button from "./common/button.ui";

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
      {loadedTokens && loadedTokens?.length <= 0 &&
        <Modal modalStyles="!min-h-fit" handleClose={() => { }}>
          <div className="grid justify-center">
            <div className="grow text-center text-white grid gap-4">
              <p className="font-bold text-2xl">Backpack Empty</p>
              <p className="text-lg">You do not own any<br />Lukso Citizens.</p>
            </div>
            <div className="grid gap-4 pt-8">
              <Button label="Get one here" textStiles="w-full text-center" light handleClick={() => { }} />
            </div>
          </div>
        </Modal>
      }
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
