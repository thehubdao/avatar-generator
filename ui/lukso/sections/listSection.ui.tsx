import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { TokenId } from "../../../types/metadata.type";
import CampaignDropdown from "../../../components/lukso/dropdown.component";
import ListItem from "../common/listItem";



interface ListSectionUIProps {
    provider: ethers.BrowserProvider | undefined;
    tokenIdList: TokenId[] | undefined
    onClickViewButton: (campaign: string, combination: string, baseCombination: string, combinationPictureUrl: string) => void;
    onClickEditButton: (campaign: string, combination: string, baseCombination: string, combinationPictureUrl: string) => void;

}



const campaignLabels = {
    'all': {
        campaignName: 'all',
        nftName: 'Choose Campaign',
        dropdownName: 'Choose Campaign'
    },
    'lukso female b': {
        campaignName: 'lukso female b',
        nftName: 'Lukso Citizen',
        dropdownName: 'Lukso Citizens'
    }, 'lukso2': { campaignName: 'lukso2', nftName: 'Lukso Creator', dropdownName: 'Lukso Creators' }
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
        <div className="flex justify-center flex-col items-center h-full w-full">  {/* Your collection text image */}
            <div className="text-white font text-6xl font-extrabold ">
                <Image src="/resources/images/collection_text.png" className="mb-[150px]" alt={""} width='990' height='38' />
            </div>
            {/* Navigator section */}
            <div className="flex flex-row min-w-[822px] justify-between mb-5">
                <div className="flex flex-row min-w-[650px]">
                    <div className="h-full bg-[#ffcaddbf] border-2 border-solid border-white border-r-0"><CiSearch className="text-white w-[38px] h-[38px]" /></div>
                    <div className="w-full h-full bg-[#ffffffbf] border-2 border-solid border-white flex justify-center"><input type='number' onChange={(e) => { setSelectedTokenId(e.target.value) }} className="placeholder:text-[#1E293B] text-[15px] w-[99%] bg-[#ffffff00] h-full focus-visible:outline-none" placeholder='Search by Token ID' /></div>
                </div>
                <CampaignDropdown setCampaign={(campaign) => { setSelectedCampaign(campaign) }} campaigns={Object.values(campaignLabels)} />
            </div>
            {/* Card List section */}
            {<div className="grid-cols-4 grid  p-3 min-h-[300px] max-h-[588px] min-w-[822px] bg-[#ffcaddbf] border-2 border-solid border-white overflow-y-scroll" >
                {isLoading && <svg className="top-[40%] left-[50%] relative animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" style={{ 'border': 'inherit' }}>
                </svg>

                }
                {processedListData && processedListData.map((tokenMetadata: TokenId) => {
                    const { tokenId, campaign } = tokenMetadata
                    const campaignDBName = campaignLabels[campaign as keyof typeof campaignLabels].campaignName
                    const nftName = campaignLabels[campaign as keyof typeof campaignLabels].nftName
                    /* ATTENTION:
                    CAMPAIGN REAL NAMES AND CAMPAIGN NAME ON DB IS DIFFERENT AND SHOULD BE TOOK INTO ACOUNT,
                    RECOMMENDABLE TO CHANGE IT IN FUTURE.
                     */
                    return  <ListItem key={campaignDBName + tokenId} campaignDBName={campaignDBName} nftName={nftName} onClickViewButton={onClickViewButton} onClickEditButton={onClickEditButton} tokenId={tokenMetadata} />
                })}</div>}
        </div >


    );

}
