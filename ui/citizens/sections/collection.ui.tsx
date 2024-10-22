import { useEffect, useRef, useState } from "react";
import CampaignCard from "../common/campaignCard.ui";
// import PlusSVG from "../common/SVG/plusSVG.ui";
import SearchSVG from "../common/SVG/searchSVG.ui";
import { TokenMetadata, Campaign } from "../../../types/metadata.type";
import { campaignLabels } from "../../../constants/lukso/labels.constant";
import { CollectionType } from "../../../types/avatar.type";
import { LogError } from "../../../utils/common.util";
import { Module } from "../../../enums/common.enum";
import SelectorUI from "../common/selector.ui";
import { CardSize } from "../../../enums/citizens/common.enum";

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
  const campaignList = useRef<string[] | undefined>([]);

  const [searchValue, setSerchValue] = useState<string | undefined>();
  const [chooseValue, setChooseValue] = useState<string | undefined>();

  const handleCardClick = (tokenId: string, tokenMetadata: TokenMetadata) => {
    if (tokenId !== currentCollection.tokenMetadata.tokenId) {
      const { campaign: newCampaign, combination: newCombination } = tokenMetadata;
      updateCollection(newCampaign as Campaign, newCombination, tokenMetadata);
    }
  };

  const filterList = (id?: string, campaign?: string) => {
    if (!loadedTokens) return LogError(Module.Citizens, 'loadedTokens is undefined');

    filteredList.current = loadedTokens.filter((token) => {
      return (campaign && campaign !== 'All' ? token.campaign.includes(campaign) : true) && (id ? token.tokenId.includes(id) : true);
    })
    if (searchValue !== id) setSerchValue(id);
    if (chooseValue !== campaign) setChooseValue(campaign);
  }

  const generateCampaignList = () => {
    if (!loadedTokens) return LogError(Module.Citizens, 'loadedTokens is undefined');

    const campaignSet: Set<string> = new Set();

    loadedTokens.forEach(item => { if (item.campaign) campaignSet.add(item.campaign) });
    campaignList.current = [...Array.from(campaignSet), 'All'];

  }

  useEffect(() => {
    generateCampaignList();
  }, [loadedTokens]);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] py-32">
      {/* MY CITIZENS */}
      <div className="container mx-auto">
        <h1 className="font-monument text-white text-6xl text-center">MY CITIZENS</h1>
        {/*  CITIZENS TABLE */}
        <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
          {/* TABLE HEADER */}
          <div className="w-full flex justify-between p-8 border-b border-white/20">
            {/* SEARCH BY ID INPUT */}
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
                  onChange={e => filterList(e.target.value, chooseValue)}
                />
              </div>
            </label>
            {/* CHOOSE CAMPAIGN SELECTOR */}
            <SelectorUI list={campaignList.current} selection={chooseValue} label="CHOOSE CAMPAIGN" selectionHandler={(value) => {
              filterList(searchValue, value);
            }}/>
          </div>
          <div className="flex flex-wrap justify-center gap-4 p-8 min-h-[336px]">
            {searchValue || chooseValue ?
              <>
                {filteredList.current && filteredList.current.length > 0 ?
                  filteredList.current.map((tokenMetadata) => (
                    <CampaignCard
                      key={tokenMetadata.campaign + tokenMetadata.tokenId}
                      title={`${campaignLabels[tokenMetadata.campaign as keyof typeof campaignLabels].nftName} #${tokenMetadata.tokenId}`}
                      tokenID={tokenMetadata.tokenId}
                      imgSrc={tokenMetadata.imageUrl}
                      imgAlt={tokenMetadata.name}
                      size={CardSize.Small}
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
                    size={CardSize.Small}
                    light
                    overlayText={currentCollection.tokenMetadata.tokenId === tokenMetadata.tokenId ? "SELECTED" : "USE CITIZEN"}
                    handleClick={() => handleCardClick(tokenMetadata.tokenId, tokenMetadata)}
                    selected={currentCollection.tokenMetadata.tokenId === tokenMetadata.tokenId}
                  />
                ))}
              </>
            }

          </div>
          {/* <div className="w-full pb-8">
            <Button label="LOAD MORE" handleClick={() => { }} withIcon className="mx-auto">
              <PlusSVG />
            </Button>
          </div> */}
        </div>
      </div>
      {/* WEARABLE DROPS */}
      <div className="container mx-auto pt-8">
        <h1 className="font-monument text-white text-6xl text-center">WEARABLE DROPS</h1>
        {/*  CITIZENS TABLE */}
        <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
          {/* TABLE HEADER */}
          <div className="w-full flex justify-between p-8 border-b border-white/20">
            {/* SEARCH BY ID INPUT */}
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
                />
              </div>
            </label>
            {/* SELECTORS */}
            <div className="flex gap-4">
              <SelectorUI label="OWNED" list={['Owned','Not Owned','All']} selectionHandler={() => { }} />
              <SelectorUI label="PRICE" list={['High to low','Low to High']} selectionHandler={() => { }} />
              <SelectorUI label="LEVEL" list={['LVL 01-10','LVL 01-10','LVL 10-20','LVL 20-30','LVL 30-40','LVL 40-50','LVL 50-60','LVL 60-70','LVL 70-80','LVL 80-90','LVL 90-100']} selectionHandler={() => { }} />
              <SelectorUI label="CHOOSE DROPS" list={['Chillwhales Head','Metaheads Hat','Platties Tee']} selectionHandler={() => { }} />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 p-8">
            {searchValue || chooseValue ?
              <>
                {filteredList.current && filteredList.current.length > 0 ?
                  filteredList.current.map((tokenMetadata) => (
                    <CampaignCard
                      key={tokenMetadata.campaign + tokenMetadata.tokenId}
                      title={`${campaignLabels[tokenMetadata.campaign as keyof typeof campaignLabels].nftName} #${tokenMetadata.tokenId}`}
                      tokenID={tokenMetadata.tokenId}
                      imgSrc={tokenMetadata.imageUrl}
                      imgAlt={tokenMetadata.name}
                      size={CardSize.Small}
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
                    size={CardSize.Small}
                    light
                    overlayText={currentCollection.tokenMetadata.tokenId === tokenMetadata.tokenId ? "SELECTED" : "USE CITIZEN"}
                    handleClick={() => handleCardClick(tokenMetadata.tokenId, tokenMetadata)}
                    selected={currentCollection.tokenMetadata.tokenId === tokenMetadata.tokenId}
                  />
                ))}
              </>
            }

          </div>
          {/* <div className="w-full pb-8">
            <Button label="LOAD MORE" handleClick={() => { }} withIcon className="mx-auto">
              <PlusSVG />
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}