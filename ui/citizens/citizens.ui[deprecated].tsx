import { Campaign, CitizensSections } from "../../enums/citizens/common.enum";
import { IndexFeatureInterface } from "../../interfaces/api.interface";
import { CollectionType } from "../../interfaces/avatar.interface";
import { CitizenMetadata } from "../../interfaces/citizens.interface";
import DetailsUI from "./common/details.ui";
import Notifications from "./common/notifications.ui";
import Collection from "./sections/collection.ui[deprecated]";
import LeaderBoard from "./sections/leaderBoard.ui[deprecated]";
import Play from "./sections/play.ui[deprecated]";
import { LeaderboardEntry } from '../../types/leaderboard.type';
import { JsonRpcProvider } from "ethers";
import Modal from "./common/modal.ui";
import Button from "./common/button.ui";
import { ClaimableDrop } from "../../interfaces/citizens.interface";
import { useEffect, useState } from "react";
import MintUI from "./common/mint.ui";

interface CitizensUIProps {
  currentSection: CitizensSections;
  loadedTokens?: CitizenMetadata[];
  currentCollection: CollectionType;
  isSavingCombination?: boolean;
  updateCollection: (newCampaign: Campaign, newCombination: string, tokenMetadata: CitizenMetadata) => void;
  features?: IndexFeatureInterface[];
  exportModel: () => Promise<boolean>;
  address: string;
  leaderboardData?: LeaderboardEntry[];
  provider: JsonRpcProvider | null;
  handleFollowUser: (address: string) => Promise<boolean>;
  handleUnfollowUser: (address: string) => Promise<boolean>;
  handleClaim: (drop: ClaimableDrop) => Promise<boolean>
  claimableDrops: ClaimableDrop[]
  mintRedirect: () => Promise<boolean>
}


export default function CitizensUI({ claimableDrops, currentSection, currentCollection, isSavingCombination, updateCollection, loadedTokens, features, exportModel, address, leaderboardData, provider, handleFollowUser, handleClaim, handleUnfollowUser, mintRedirect }: CitizensUIProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [collectionSupply] = useState<number | undefined>(undefined)

/*   useEffect(() => {
    const fetchCollectionSupply = async () => {
      if(!isSolana) return
      const supply = await getCollectionSupply(solanaWallets[0])
      setCollectionSupply(supply)
    }
    fetchCollectionSupply()
  }, [address]) */

/*   useEffect(() => {
    console.log('loadedTokens', loadedTokens)
    if (loadedTokens && loadedTokens.length === 0 && isEthereum)
        setIsModalOpen(true)
          
  }, [loadedTokens]) */

  useEffect(() => {
    console.log("CURRENT SECTION", currentSection)
  }, [currentSection])

  return (
    <>
      {currentSection === CitizensSections.View && (
        <>
          {/* details */}
          {features &&
            <DetailsUI data={features} handleDownload={() => exportModel()} imgUrl={currentCollection.citizenMetadata.imageUrl} loading={isSavingCombination} />
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
            provider={provider}
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
        <MintUI supply={collectionSupply} onMinting={mintRedirect} />
      }
    </>
  );
}
