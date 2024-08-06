import { useEffect, useState } from "react"
import { CiCircleChevDown } from "react-icons/ci"

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
    element?.classList.toggle('hidden')
  }, [isDropdownDisplayed])

  return (
    <div className={`relative min-w-[170px] h-full border-2 border-white hover:bg-white/70 ${isDropdownDisplayed ? 'bg-white/70':'bg-white/20'} transition-colors duration-300`}>
      <button
        onClick={() => { setIsDropdownDisplayed(!isDropdownDisplayed) }} 
        id="dropdownDefaultButton" 
        data-dropdown-toggle="dropdown"
        className="w-full h-[38px] text-sm flex justify-between items-center px-2 text-gray-dark/80"
      >
        {selected ? selected.dropdownName : 'Choose Campaign'}
        <CiCircleChevDown className={`w-6 h-6 ml-2 ${isDropdownDisplayed ? 'rotate-180':'rotate-0'} transition-transform duration-300`} />
      </button>
      <div id="dropdown" className="w-full border-2 border-solid border-white absolute top-[42px] z-20 hidden bg-[#fff] divide-y divide-gray-100 shadow ">
        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
          {campaigns?.map((campaign: { campaignName: string, nftName: string, dropdownName: string }) => {
            const dropdownName = campaign.dropdownName
            return <li key={dropdownName} className={`hover:bg-[#FFEEF4] hover:cursor-pointer ${campaign == selected ? 'bg-[#FFEEF4]' : ''}`}
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
