import { useRef, useState } from "react";
import Button from "../common/button.ui";
import CampaignCard from "../common/campaignCard.ui";
import PlusSVG from "../common/SVG/plusSVG.ui";
import SearchSVG from "../common/SVG/searchSVG.ui";
import ArrowSVG from "../common/SVG/arrowSVG.ui";
import { TokenMetadata, Campaign } from "../../../types/metadata.type";
import { campaignLabels } from "../../../constants/lukso/labels.constant";
import { CollectionType } from "../../../types/avatar.type";

const CAMPAIGNS: string[] = [
  'Campaign 01',
  'Campaign 02',
  'Campaign 03',
  'Campaign 04',
  'Campaign 05',
  'Campaign 06',
];

interface CollectionProps {
  loadedTokens?: TokenMetadata[];
  currentCollection: CollectionType
  updateCollection: (newCampaign: Campaign, newCombination: string, tokenMetadata: TokenMetadata) => void;
}

export default function Collection({
  loadedTokens,
  updateCollection,
  currentCollection
}: CollectionProps) {

  const filteredList = useRef<TokenMetadata[] | undefined>([]);

  const [searchValue, setSerchValue] = useState<string | undefined>();
  const [isCampaignSelectorOpen, setIsCampaignSelectorOpen] = useState<boolean>(false);

  const handleCardClick = (tokenId: string, tokenMetadata: TokenMetadata) => {
    if (tokenId !== currentCollection.tokenMetadata.tokenId) {
      const { campaign: newCampaign, combination: newCombination } = tokenMetadata;
      updateCollection(newCampaign as Campaign, newCombination, tokenMetadata);
    }
  };

  const filterByTokenID = (id: string) => {
    filteredList.current = loadedTokens?.filter((token) => {
      return token.tokenId.includes(id);
    })
    setSerchValue(id);
  }

  // const filterByCampaign = (id: string) => {
  //   filteredList.current = loadedTokens?.filter((token) => {
  //     return token.campaign.includes(id);
  //   })
  //   setSerchValue(id);
  // }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] py-32">
      <div className="container mx-auto">
        <h1 className="font-monument text-white text-6xl text-center">MY CITIZENS</h1>
        <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
          <div className="w-full flex justify-between p-8 border-b border-white/20">
            <label className="flex">
              <div className="flex justify-center items-center w-12 shadow-citizens-input rounded-l-full">
                <SearchSVG />
              </div>
              <div>
                <input
                  type="number"
                  name=""
                  id=""
                  placeholder="SEARCH BY TOKEN ID"
                  className="w-80 bg-[#2D2D2D] text-lg text-white placeholder:text-white focus-visible:outline-none px-4 py-2 shadow-citizens-input rounded-r-full"
                  value={searchValue}
                  onChange={e => filterByTokenID(e.target.value)}
                />
              </div>
            </label>
            <div className="relative">
              <Button label="CHOOSE CAMPAIGN" handleClick={() => { setIsCampaignSelectorOpen(!isCampaignSelectorOpen) }} withIcon textStiles="px-4">
                <div className={`${isCampaignSelectorOpen ? 'rotate-180' : ''}`}>
                  <ArrowSVG className="fill-white" />
                </div>
              </Button>
              <p className="absolute top-full right-0 px-2 mt-1 text-xs text-white/20">{currentCollection.campaign}</p>
              {isCampaignSelectorOpen &&
                <div className="absolute top-full w-full max-h-96 overflow-y-auto rounded-2xl mt-2 p-4 bg-citizens-dark shadow-citizens-btn z-10">
                  {
                    CAMPAIGNS.map((campaign, index) => (
                      <div key={index} className="py-2 cursor-pointer border-b border-white/10 last:border-none" onClick={() => {
                        setIsCampaignSelectorOpen(false);
                      }}>
                        <p className="text-white truncate">{campaign}</p>
                      </div>
                    ))
                  }
                </div>
              }
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 p-8">
            {searchValue ?
              <>
                {filteredList.current && filteredList.current.length > 0 ?
                  filteredList.current.map((tokenMetadata) => (
                    <CampaignCard
                      key={tokenMetadata.campaign + tokenMetadata.tokenId}
                      title={`${campaignLabels[tokenMetadata.campaign as keyof typeof campaignLabels].nftName} #${tokenMetadata.tokenId}`}
                      tokenID={tokenMetadata.tokenId}
                      imgSrc={tokenMetadata.imageUrl}
                      imgAlt={tokenMetadata.name}
                      small
                      light
                      overlayText={currentCollection.tokenMetadata.tokenId === tokenMetadata.tokenId ? "SELECTED" : "USE CITIZEN"}
                      handleClick={() => handleCardClick(tokenMetadata.tokenId, tokenMetadata)}
                      selected={currentCollection.tokenMetadata.tokenId === tokenMetadata.tokenId}
                    />
                  ))
                  :
                  <p className="font-light text-white">no results found!</p>
                }
              </>
              :
              <>
                {loadedTokens && loadedTokens.map((tokenMetadata) => (
                  <CampaignCard
                    key={tokenMetadata.campaign + tokenMetadata.tokenId}
                    title={`${campaignLabels[tokenMetadata.campaign as keyof typeof campaignLabels].nftName} #${tokenMetadata.tokenId}`}
                    tokenID={tokenMetadata.tokenId}
                    imgSrc={tokenMetadata.imageUrl}
                    imgAlt={tokenMetadata.name}
                    small
                    light
                    overlayText={currentCollection.tokenMetadata.tokenId === tokenMetadata.tokenId ? "SELECTED" : "USE CITIZEN"}
                    handleClick={() => handleCardClick(tokenMetadata.tokenId, tokenMetadata)}
                    selected={currentCollection.tokenMetadata.tokenId === tokenMetadata.tokenId}
                  />
                ))}
              </>
            }

          </div>
          <div className="w-full pb-8">
            <Button label="LOAD MORE" handleClick={() => { }} withIcon className="mx-auto">
              <PlusSVG />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}