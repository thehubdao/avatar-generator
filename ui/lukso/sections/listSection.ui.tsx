import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { TokenMetadata } from "../../../types/metadata.type";
import CampaignDropdown from "../../../components/lukso/dropdown.component";
import ListItem from "../common/listItem";



interface ListSectionUIProps {
    provider: ethers.BrowserProvider | undefined;
    listData: TokenMetadata[] | undefined
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
        dropdownName: 'Citizens'
    }, 'lukso2': { campaignName: 'lukso2', nftName: 'Lukso Creator', dropdownName: 'Creators' }
}


const filterByCampaign = (campaign: string, listData: TokenMetadata[]) => {
    return listData.filter((data: TokenMetadata) => data.campaign === campaign)
}

const filterByTokenId = (tokenId: string, listData: TokenMetadata[]) => {
    return listData.filter((data: TokenMetadata) => {
        return data.tokenId.toString().includes(tokenId)
    })
}

export default function ListUI({ listData, onClickViewButton, onClickEditButton }: ListSectionUIProps) {
    const [processedListData, setProcessedListData] = useState<Array<TokenMetadata>>()
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
    const [selectedTokenId, setSelectedTokenId] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!listData) return
        setProcessedListData(listData)
        setIsLoading(false)
        console.log(listData)
    }, [listData])

    useEffect(() => {
        if (!listData) return
        if (selectedCampaign === 'all')
            return setProcessedListData(filterByTokenId(selectedTokenId, listData))

        const listDatafilteredByCampaign = filterByCampaign(selectedCampaign, listData)
        const listDatafilteredByTokenId = filterByTokenId(selectedTokenId, listDatafilteredByCampaign)
        setProcessedListData(listDatafilteredByTokenId)
    }, [selectedCampaign])

    useEffect(() => {
        if (!listData) return

        const listDatafilteredByTokenId = filterByTokenId(selectedTokenId, listData)

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
                {processedListData && processedListData.map(({ tokenId, campaign, imageUrl, combination, baseCombination, fallbackImageUrl }: TokenMetadata) => {
                    const campaignDBName = campaignLabels[campaign as keyof typeof campaignLabels].campaignName
                    const nftName = campaignLabels[campaign as keyof typeof campaignLabels].nftName
                    /* ATTENTION:
                    CAMPAIGN REAL NAMES AND CAMPAIGN NAME ON DB IS DIFFERENT AND SHOULD BE TOOK INTO ACOUNT,
                    RECOMMENDABLE TO CHANGE IT IN FUTURE.
                     */

                    if (!baseCombination) baseCombination = combination

                    return <ListItem key={campaignDBName + tokenId} campaignDBName={campaignDBName} nftName={nftName} onClickViewButton={onClickViewButton} onClickEditButton={onClickEditButton} fallbackImageUrl={fallbackImageUrl} imageUrl={imageUrl} combination={combination} baseCombination={baseCombination} tokenId={tokenId} />
                })}</div>}
        </div >


    );

}
