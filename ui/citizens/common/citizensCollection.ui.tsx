import { useEffect, useRef, useState } from "react";
import SearchSVG from "./SVG/searchSVG.ui";
import {TokenMetadata } from "../../../types/metadata.type";
import { LogError } from "../../../utils/common.util";
import { Module } from "../../../enums/common.enum";
import SelectorUI from "./selector.ui";
import CampaignCard from "./campaignCard.ui";
import { campaignLabels } from "../../../constants/lukso/labels.constant";
import { Campaign, CardSize } from "../../../enums/citizens/common.enum";
import { CollectionType } from "../../../types/avatar.type";

interface CitizensCollectionProps {
  tokenList?: TokenMetadata[];
  currentCollection: CollectionType;
  updateCollection: (newCampaign: Campaign, newCombination: string, tokenMetadata: TokenMetadata) => void;
}

export default function CitizensCollection({ tokenList, currentCollection, updateCollection }: CitizensCollectionProps) {

  const filteredList = useRef<TokenMetadata[] | undefined>([]);
  const [campaignList, setCampaignList] = useState<string[] | undefined>([]);

  const [searchValue, setSerchValue] = useState<string | undefined>();
  const [chooseValue, setChooseValue] = useState<string | undefined>();

  const filterList = (id?: string, campaign?: string) => {
    if (!tokenList) return LogError(Module.Citizens, 'Token list is undefined');

    filteredList.current = tokenList.filter((token) => {
      return (campaign && campaign !== 'All' ? token.campaign.includes(campaign) : true) && (id ? token.tokenId.includes(id) : true);
    })
    if (searchValue !== id) setSerchValue(id);
    if (chooseValue !== campaign) setChooseValue(campaign);
  }

  const handleCardClick = (tokenId: string, tokenMetadata: TokenMetadata) => {
    if (tokenId !== currentCollection.tokenMetadata.tokenId) {
      const { campaign: newCampaign, combination: newCombination } = tokenMetadata;
      updateCollection(newCampaign as Campaign, newCombination, tokenMetadata);
    }
  }

  const generateCampaignList = () => {
    if (!tokenList) return LogError(Module.Citizens, 'Token list is undefined');

    const campaignSet: Set<string> = new Set();

    tokenList.forEach(item => { if (item.campaign) campaignSet.add(item.campaign) });
    setCampaignList([...Array.from(campaignSet), 'All']);
  }

  useEffect(() => {
    generateCampaignList();
  }, [tokenList]);

  return (
    <div className="container mx-auto xl:pt-8 px-6 2xl:px-0">
      {/* TABLE */}
      <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
        {/* TABLE HEADER */}
        <div className="w-full flex flex-col xl:flex-row justify-between p-4 sm:p-8 border-b border-white/20">
          {/* SEARCH BY ID INPUT */}
          <label className="flex w-full xl:w-auto">
            <div className="flex justify-center items-center w-12 shadow-citizens-input rounded-l-full">
              <SearchSVG />
            </div>
            <div className='w-full xl:w-auto'>
              <input
                type="number"
                name=""
                id=""
                placeholder="SEARCH BY TOKEN ID"
                className="w-full xl:w-80 bg-[#2D2D2D] text-lg text-white placeholder:text-white focus-visible:outline-none px-4 py-2 shadow-citizens-input rounded-r-full"
                value={searchValue}
                onChange={e => filterList(e.target.value, chooseValue)}
              />
            </div>
          </label>
          {/* SELECTORS */}
          <div className="flex lg:gap-4 justify-between lg:justify-center pt-6 xl:pt-0">
            <SelectorUI list={campaignList} selection={chooseValue} label="CHOOSE CAMPAIGN" areCampaigns selectionHandler={(value) => {
              filterList(searchValue, value);
            }} />
          </div>
        </div>
        {/* DROPS LIST */}
        <div className="flex flex-wrap justify-center gap-4 p-8 min-h-[336px]">
          {searchValue || chooseValue ?
            <>
              {filteredList.current && filteredList.current.length > 0 ?
                filteredList.current.map((tokenMetadata) => (
                  <CampaignCard
                    key={tokenMetadata.campaign + tokenMetadata.tokenId}
                    title={`${campaignLabels[tokenMetadata.campaign as keyof typeof campaignLabels].nftName} #${tokenMetadata.tokenId}`}
                    tokenID={'#' + tokenMetadata.tokenId}
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
              {tokenList && tokenList.map((tokenMetadata) => (
                <CampaignCard
                  key={tokenMetadata.campaign + tokenMetadata.tokenId}
                  title={`${campaignLabels[tokenMetadata.campaign as keyof typeof campaignLabels].nftName} #${tokenMetadata.tokenId}`}
                  tokenID={'#' + tokenMetadata.tokenId}
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
      </div>
    </div>
  )
}