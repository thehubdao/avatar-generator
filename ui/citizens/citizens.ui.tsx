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
import { DataBaseDrop } from "../../interfaces/citizens.interface";
import { useEffect, useState } from "react";
import MintUI from "./sections/mint.ui";

interface CitizensUIProps {
  currentSection: CitizensSections;
  loadedTokens?: TokenMetadata[];
  currentCollection: CollectionType;
  isSavingCombination?: boolean;
  updateCollection: (newCampaign: Campaign, newCombination: string, tokenMetadata: TokenMetadata) => void;
  features?: IndexFeatureInterface[];
  exportModel: () => Promise<void>;
  address: string;
  leaderboardData?: LeaderboardEntry[];
  signer: JsonRpcSigner | null;
  handleFollowUser: (address: string) => Promise<boolean>;
  handleUnfollowUser: (address: string) => Promise<boolean>;
  handleClaim: (drop: DataBaseDrop) => Promise<boolean>
  claimableDrops: DataBaseDrop[]
}


export default function CitizensUI({ claimableDrops, currentSection, currentCollection, isSavingCombination, updateCollection, loadedTokens, features, exportModel, address, leaderboardData, signer, handleFollowUser, handleClaim, handleUnfollowUser }: CitizensUIProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!loadedTokens)
      setIsModalOpen(true)
  }, [loadedTokens])

  return (
    <>
      {currentSection === CitizensSections.View && (
        <>
          {/* details */}
          {features &&
            <DetailsUI data={features} handleDownload={() => exportModel()} imgUrl={currentCollection.tokenMetadata.imageUrl} loading={isSavingCombination} />
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
            claimableDrops={claimableDrops}
            handleClaim={handleClaim} />
        </>
      )}
      {isModalOpen &&
        <Modal modalStyles="!min-h-fit" handleClose={() => { setIsModalOpen(false) }}>
          <div className="grid justify-center">
            <div className="grow text-center text-white grid gap-4">
              <p className="font-bold text-2xl">Backpack Empty</p>
              <p className="text-lg">You do not own any<br />Lukso Citizens.</p>
            </div>
            <div className="grid gap-4 pt-8">
              <Button label="Get one here" textStyles="w-full text-center" light handleClick={() => {

                const a = document.createElement('a');
                a.target = "_blank";
                a.href = 'https://universal.page/collections/lukso/0x74654920356257981f6b63a65ad72d4d9bc21929';
                a.click()
              }} />
            </div>
          </div>
        </Modal>
      }
      {currentSection === CitizensSections.LeaderBoard && (
        <LeaderBoard
          leaderboardData={leaderboardData}
          onFollowUser={handleFollowUser}
          onUnfollowUser={handleUnfollowUser}
        />
      )}
      {currentSection === CitizensSections.Play &&
        <Play />
      }
      {currentSection === CitizensSections.Mint &&
        <MintUI />
      }
    </>
  );
}
