import { useEffect, useState } from "react"

interface MainSectionUIProps {
    setCampaign: (campaign: string) => void
    campaigns: Array<{ campaignName: string, nftName: string, dropdownName: string }>
}

export default function CampaignDropdown({ campaigns, setCampaign }: MainSectionUIProps) {
    const [selected, setSelected] = useState<{ campaignName: string, nftName: string, dropdownName: string }>()
    const [isDropdownDisplayed, setIsDropdownDisplayed] = useState<boolean>()

    useEffect(() => {
        if (isDropdownDisplayed === undefined) return
        const element = document.getElementById('dropdown')
        console.log(element)
        element?.classList.toggle('hidden')
    }, [isDropdownDisplayed])

    return (
        <div className="border-box relative min-w-[145px] m-l-3 h-full bg-[#ffffffbf] focus-visible:outline-none border-2 border-solid border-white flex justify-center">
            <button onClick={() => { setIsDropdownDisplayed(!isDropdownDisplayed) }} id="dropdownDefaultButton" data-dropdown-toggle="dropdown"
                className=" ml-[5px] text-[15px] text-[#1E293B] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
                {!selected && 'Choose Campaign'}
                {selected && selected.dropdownName}
                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>
            <div id="dropdown" className="min-w-[145px] absolute top-[42px] z-20 hidden bg-[#fff] divide-y divide-gray-100 shadow ">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                    {campaigns?.map((campaign: { campaignName: string, nftName: string, dropdownName: string }) => {
                        const dropdownName = campaign.dropdownName
                        return <li className={`hover:bg-[#FFEEF4] hover:cursor-pointer ${campaign == selected ? 'bg-[#FFEEF4]' : ''}`}
                            onClick={() => {
                                setSelected(campaign)
                                setCampaign(campaign.campaignName)
                            }}>
                            <a className="text-[#1E293B] block px-4 py-2  ">{dropdownName}</a>
                        </li>
                    })}
                </ul>
            </div>
        </div>
    )

}
