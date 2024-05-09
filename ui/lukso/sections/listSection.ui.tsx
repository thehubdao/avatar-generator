import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Campaign, TokenMetadata, campaigns } from "../../../types/metadata.type";
import CampaignDropdown from "../../../components/lukso/dropdown.component";


interface MainSectionUIProps {
    provider: ethers.BrowserProvider | undefined;
    setCombination: (combination: string) => void;
    listData: TokenMetadata[]
}



const campaignLabels = {
    'all': {
        campaignName: 'all',
        nftName: 'Choose Campaign',
        dropdownName: 'Choose Campaign'
    },
    'citizens': {
        campaignName: 'citizens',
        nftName: 'Lukso Citizen',
        dropdownName: 'Citizens'
    }, 'creators': { campaignName: 'creators', nftName: 'Lukso Creator', dropdownName: 'Creators' }
}


const filterByCampaign = (campaign: string, listData: TokenMetadata[]) => {
    return listData.filter((data: any) => data.campaign === campaign)
}

const filterByTokenId = (tokenId: string, listData: TokenMetadata[]) => {
    return listData.filter((data: TokenMetadata) => {
        console.log(data.tokenId.toString().includes(tokenId), data.tokenId.toString(), tokenId)
    return data.tokenId.toString().includes(tokenId)})
}

export default function ListUI({ listData, setCombination }: MainSectionUIProps) {
    const [processedListData, setProcessedListData] = useState<Array<TokenMetadata>>()
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
    const [selectedTokenId, setSelectedTokenId] = useState<string>('')


    useEffect(() => {
        setProcessedListData(listData)
    }, [listData])

    useEffect(() => {
        if (!processedListData) return
        if (selectedCampaign === 'all')
            return setProcessedListData(filterByTokenId(selectedTokenId, listData))

        const listDatafilteredByCampaign = filterByCampaign(selectedCampaign, listData)
        const listDatafilteredByTokenId = filterByTokenId(selectedTokenId, listDatafilteredByCampaign)
        console.log(listDatafilteredByCampaign,listDatafilteredByTokenId)
        setProcessedListData(listDatafilteredByTokenId)
    }, [selectedCampaign])

    useEffect(() => {
        if (!processedListData) return

        const listDatafilteredByTokenId = filterByTokenId(selectedTokenId, listData)
        const listDatafilteredByCampaign = filterByCampaign(selectedCampaign, listDatafilteredByTokenId)
        setProcessedListData(listDatafilteredByCampaign)
    }, [selectedTokenId])

    return (
        <div className="flex justify-center flex-col items-center h-full w-full">  {/* Your collection text image */}
            <div className="text-white font text-6xl font-extrabold ">
                <Image src="/resources/images/collection_text.png" alt={""} width='990' height='38' />
            </div>
            {/* Navigator section */}
            <div className="flex flex-row min-w-[822px] justify-between">
                <div className="flex flex-row min-w-[650px]">
                    <div className="h-full bg-[#ffcaddbf] border-2 border-solid border-white border-r-0"><CiSearch className="text-white w-[38px] h-[38px]" /></div>
                    <div className="w-full h-full bg-[#ffffffbf] border-2 border-solid border-white flex justify-center"><input type='number' onChange={(e) => { setSelectedTokenId(e.target.value) }} className="placeholder:text-[#1E293B] text-[15px] w-[99%] bg-[#ffffff00] h-full focus-visible:outline-none" placeholder='Search by Token ID' /></div>
                </div>
                <CampaignDropdown setCampaign={(campaign) => { setSelectedCampaign(campaign) }} campaigns={Object.values(campaignLabels)} />
            </div>
            {/* Card List section */}
            {processedListData && <div className="flex-wrap flex flex-row p-3 min-w-[822px] bg-[#ffcaddbf] border-2 border-solid border-white">
                {processedListData.map(({ tokenId, campaign, imageUrl }: TokenMetadata) => {
                    return <>
                        <div key={campaign + tokenId} className="ml-2 bg-[#ffffffbf] rounded-[10px_10px_10px_10px] border-[1.58px] border-solid border-white">
                            <div className='relative flex flex-col'>
                                <Image src={imageUrl} alt={"NFT Image"} className="rounded-[10px_10px_0px_0px]" width={254} height={300}></Image>
                                <div className="absolute top-[6px] left-[6px] w-[45px] h-[20px] bg-slate-800 rounded-[13px] p-1 m-[-10]">
                                    <div className="w-[40px] text-center [font-family:'Work_Sans',Helvetica] font-normal text-white text-[12px] tracking-[0] leading-[normal]">
                                        {`#${tokenId}`}
                                    </div>
                                </div>

                                <div className="text-center p-1 [font-family:'Work_Sans',Helvetica] font-medium text-slate-800 text-[14px] tracking-[0] leading-[normal]">
                                    {`${campaignLabels[campaign as keyof typeof campaignLabels].nftName} #${tokenId}`}
                                </div>
                            </div>

                        </div >

                    </>
                })}</div>}
        </div >


    );

}
