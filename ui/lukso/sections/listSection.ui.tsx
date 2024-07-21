import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Campaign, TokenId, TokenMetadata } from "../../../types/metadata.type";
import CampaignDropdown from "../../../components/lukso/dropdown.component";
import ListItem from "../common/listItem";
import TransparentBoxUI from "../common/transparentBox.ui";
import Loader from "../common/loader.ui";

interface ListSectionUIProps {
  provider: ethers.BrowserProvider | undefined;
  tokenIdList: TokenId[] | undefined
  onClickViewButton: (campaign: Campaign, combination: string, baseCombination: string, combinationPictureUrl: string, tokenMetadata: TokenMetadata, tokenId: number) => void;
  onClickEditButton: (campaign: Campaign, combination: string, baseCombination: string, combinationPictureUrl: string, tokenMetadata: TokenMetadata, tokenId: number) => void

}



const campaignLabels = {
  'all': {
    campaignName: 'all',
    nftName: 'Choose Campaign',
    dropdownName: 'All'
  },
  'vrm_female': {
    campaignName: 'vrm_female',
    nftName: 'Lukso Citizen',
    dropdownName: 'Lukso Citizens'
  }, 'vrm_male': { campaignName: 'vrm_male', nftName: 'Lukso Creator', dropdownName: 'Lukso Creators' }
}


const filterByCampaign = (campaign: string, listData: TokenId[]) => {
  return listData.filter((data: TokenId) => data.campaign === campaign)
}

const filterByTokenId = (tokenId: string, listData: TokenId[]) => {
  return listData.filter((data: TokenId) => {
    return data.tokenId.toString().includes(tokenId)
  })
}

export default function ListUI({ tokenIdList, onClickViewButton, onClickEditButton }: ListSectionUIProps) {
  const [processedListData, setProcessedListData] = useState<TokenId[]>()
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
  const [selectedTokenId, setSelectedTokenId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [shouldReveal, setReveal] = useState(false);

  useEffect(() => {
    if (!tokenIdList) return
    setProcessedListData(tokenIdList)
    setIsLoading(false)
  }, [tokenIdList])

  useEffect(() => {
    if (!tokenIdList) return
    if (selectedCampaign === 'all')
      return setProcessedListData(filterByTokenId(selectedTokenId, tokenIdList))

    const listDatafilteredByCampaign = filterByCampaign(selectedCampaign, tokenIdList)
    const listDatafilteredByTokenId = filterByTokenId(selectedTokenId, listDatafilteredByCampaign)
    setProcessedListData(listDatafilteredByTokenId)
  }, [selectedCampaign])

  useEffect(() => {
    if (!tokenIdList) return

    const listDatafilteredByTokenId = filterByTokenId(selectedTokenId, tokenIdList)

    if (selectedCampaign === 'all') return setProcessedListData(listDatafilteredByTokenId)

    const listDatafilteredByCampaign = filterByCampaign(selectedCampaign, listDatafilteredByTokenId)
    setProcessedListData(listDatafilteredByCampaign)

  }, [selectedTokenId])

  return (
    <div className="flex flex-col items-center gap-8 pt-10 h-full w-full ">
      {/* Your collection text image */}
      <div className="">
        <Image
          src="/resources/images/collection_text.png"
          className={`${shouldReveal ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          alt={""}
          width='990'
          height='38'
          onLoadingComplete={() => setReveal(true)}
        />
      </div>
      {/* LIST LOADER */}
      {isLoading &&
        <div className={`w-full h-full flex justify-center items-center ${isLoading ? 'flex' : 'hidden'}`}>
          <div className="flex flex-col justify-center items-center">
            <Loader />
            <h2 className="text-white font-light">Loading campaigns...</h2>
          </div>
        </div>
      }
      <div className={` opacity-0 ${isLoading ? 'invisible' : 'visible opacity-100'} transition-opacity duration-500 delay-500`}>
        {/* Navigator section */}
        <div className="flex flex-row min-w-[822px] justify-between mb-5">
          <div className="flex flex-row min-w-[650px]">
            <div className="h-full border-2 border-solid border-white border-r-0 flex justify-center items-center">
              <CiSearch className="text-white w-9 h-9" />
            </div>
            <div className="w-full h-full border-2 border-solid border-white flex justify-center">
              <input type='number' onChange={(e) => { setSelectedTokenId(e.target.value) }} className="w-full text-sm h-full px-2 focus-visible:outline-none bg-white/20 hover:bg-white/70 focus:bg-white/70 transition-colors duration-500 placeholder:text-gray-dark/80" placeholder='Search by Token ID' />
            </div>
          </div>
          <CampaignDropdown setCampaign={(campaign) => { setSelectedCampaign(campaign) }} campaigns={Object.values(campaignLabels)} />
        </div>
        {/* Card List section */}
        <div className={`relative ${processedListData?.length == 0 || isLoading ? 'grid-cols-1' : 'grid-cols-4'}  grid  p-3 min-h-[318px] max-h-[60vh] min-w-[822px] max-w-[1092px] overflow-hidden bg-[#ffcaddbf] border-2 border-solid border-white overflow-y-auto`} >
          {processedListData?.length == 0 &&
            <div className="flex flex-col justify-center items-center"><span className="text-[#C25399]">You do not own any citizens.</span>
              <div className="w-[150px] mt-3">
                <a className="flex items-center" target="_blank" href="https://universal.page/profiles/lukso/0xfa39a2207f1d1c1cec32502000481f0fef660384?tab=created">
                  <TransparentBoxUI aditionalClass="cursor-pointer" fullWidth border backgroundColorClass="bg-white" heightClass="h-12" paddingClass="p-[0px]">
                    <p className="text-black font-semibold">Buy Here</p>
                  </TransparentBoxUI>
                </a>
              </div>
            </div>
          }
          {processedListData &&
            processedListData.map((tokenMetadata: TokenId) => {
              const { tokenId, campaign } = tokenMetadata
              const campaignDBName = campaignLabels[campaign as keyof typeof campaignLabels].campaignName as Campaign
              const nftName = campaignLabels[campaign as keyof typeof campaignLabels].nftName
              /* ATTENTION:
              CAMPAIGN REAL NAMES AND CAMPAIGN NAME ON DB IS DIFFERENT AND SHOULD BE TOOK INTO ACOUNT,
              RECOMMENDABLE TO CHANGE IT IN FUTURE.
              */
              return <ListItem key={campaignDBName + tokenId} campaignDBName={campaignDBName} nftName={nftName} onClickViewButton={onClickViewButton} onClickEditButton={onClickEditButton} tokenId={tokenMetadata} />
            }
            )
          }
        </div>
      </div>
    </div >


  );

}
