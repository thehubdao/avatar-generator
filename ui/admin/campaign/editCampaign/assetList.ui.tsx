import { useEffect, useState } from "react";
import AssetCard from "./assetCard.ui";
import { useAppSelector } from "../../../../store/hooks";
import { AssetType } from "../../../../types/asset.type";
import { FirestoreLocation } from "../../../../enums/firebase.enum";
import { FeatureBasic } from "../../../../interfaces/common.interface";
import { FeatureInterface } from "../../../../interfaces/api.interface";
import { AiOutlineCloseCircle } from "react-icons/ai";
import AGButton from "../../../common/ag-button.component";

interface AssetListInterface {
  activedOption: FirestoreLocation,
}

interface CampaignAssetsInterface {
  features: AssetType[],
  accessories: AssetType[],
  animations: AssetType[],
  environments: AssetType[]
}

export default function AssetList({ activedOption }: AssetListInterface) {
  //* Fetching campaign assets and features using custom hooks
  const campaignAssets = useAppSelector(state => state.currentCampaign.assets);
  const campaignTags = useAppSelector(state => {
    if (activedOption === ('features' || 'accessories'))
      return state.currentCampaign.parameters[activedOption]
    return []
  });

  //* State variables for search and filtering
  const [searchByNameValue, setSearchByNameValue] = useState<string>('');
  const [searchByTagValue, setSearchByTagValue] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<number>(-1);
  const [searchFilteredList, setSearchFilteredList] = useState<AssetType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // *Event handler for searching assets by name
  const handleSearchByName = (event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault()
    setShowSuggestions(true)
    setSearchByNameValue(event.currentTarget.value)
  }

  //* Updates the searchByTagValue state based on the provided tag.
  const handleSearchByTag = (tag: string) => {
    //* Create a deep copy of the searchByTagValue array
    let deepTagCopyArray: string[] = JSON.parse(JSON.stringify(searchByTagValue));
    //* Check if the tag already exists in the tag array
    deepTagCopyArray.includes(tag)
      ? deepTagCopyArray = deepTagCopyArray.filter((item) => item !== tag)
      : deepTagCopyArray.push(tag)
    setSearchByTagValue(deepTagCopyArray)
  }

  //* handle reset search by tag value
  const handleResetTags = () => {
    setSearchByTagValue([])
  }

  //* Event handler for clicking on a suggested search item
  const handleOnClickSuggestionSearch = (itemName: string) => { setSearchByNameValue(itemName) }

  //* Event handler for keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' && selectedItem >= 0) {
      event.preventDefault();
      setSelectedItem(prev => (prev - 1));
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedItem(prev => (prev + 1) % searchFilteredList.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      //* Get the name from the selected suggestion in the searchFilteredList or use the current searchByNameValue
      const name = searchFilteredList[selectedItem]?.name ?? searchByNameValue;
      handleOnClickSuggestionSearch(name);
      setSelectedItem(-1);
    } else {
      //* For any other key, reset the selectedItem to -1
      setSelectedItem(-1);
    }
  }

  //* Filters the items based on the search and tag filters.
  const handleFilterItems = () => {
    const listOfItemsByTag = (campaignAssets[activedOption as keyof CampaignAssetsInterface] as FeatureInterface[]).filter((asset: FeatureInterface) => {
      if (searchByTagValue.length > 0)
        return (searchByTagValue.includes(asset.type))
      return true
    })

    const listOfItems = listOfItemsByTag.filter((asset: AssetType) => {
      return asset.name.toLowerCase() === searchByNameValue.toLowerCase()
    })

    if (listOfItems.length > 0)
      return listOfItems
    return listOfItemsByTag
  }

  //* Hides the search suggestions in blur these components.
  const handleBlur = () => {
    //* Applies await delay if an on click is executed on an internal suggestion.
    setTimeout(() => {
      setShowSuggestions(false)
    }, 300)
  }

  //* Updates the filtered list of items based on the search and tag filters using the useEffect hook.
  useEffect(() => {
    const filterItems = (campaignAssets[activedOption as keyof CampaignAssetsInterface] as FeatureInterface[])?.filter(item => {
      if (searchByTagValue.length > 0)
        return (searchByTagValue.includes(item.type))
      return true
    }).filter(item => {
      const searchTerm = searchByNameValue.toLowerCase()
      const itemName = item.name.toLowerCase()
      return searchTerm && itemName.includes(searchTerm) && itemName !== searchTerm
    }).slice(0, 10)

    setSearchFilteredList(filterItems ?? [])
  }, [searchByNameValue, searchByTagValue])

  return (
    <>
      {/* Feature filter search bar */}
      <div className="flex w-full h-full mb-10 justify-between mx-2">
        {/* By Name Searcher */}
        <div className="relative w-fit mr-5">
          <div className="relative w-fit h-fit">
            <input
              type="text"
              value={searchByNameValue}
              onChange={handleSearchByName}
              className="border-none outline-none w-72 p-1 px-3 pr-7 my-2 rounded-md nm-inset-slate-100-sm selection:border-none"
              onKeyDown={handleKeyDown}
              placeholder="Search by name..."
              onBlur={handleBlur}
            />
            <div
              className="absolute h-full flex justify-center items-center right-0 top-0 p-1 px-2 text-red cursor-pointer hover:scale-110 transition-all duration-100"
              onClick={() => { setSearchByNameValue('') }}
            ><AiOutlineCloseCircle /></div>
          </div>
          {showSuggestions && <div
            className={`absolute z-10 m-4 bg-slate-50 w-64 py-2 rounded-md shadow-2xl
            ${searchFilteredList.length == 0 ? 'hidden' : ''}`}
            onBlur={handleBlur}
          >
            {searchFilteredList.map((item, index) => {
              return <div
                onClick={() => handleOnClickSuggestionSearch(item.name)}
                onMouseEnter={() => { setSelectedItem(index) }}
                className={`px-2 ${selectedItem === index ? 'bg-orange  ' : ''}`}
                key={item.id}
              >{item.name}</div>
            })}
          </div>}
        </div>
        {/* By Tag Searcher */}
        <div className="flex flex-wrap w-full">
          {campaignTags?.map((tag: FeatureBasic) => {
            return <AGButton
              nm
              selected={searchByTagValue.includes(tag.id)}
              key={tag.id}
              onClickEvent={() => handleSearchByTag(tag.id)}
            ><p className="group-hover/button:font-medium">{tag.val}</p></AGButton>
          })}
          {(campaignTags?.length ?? 0) > 0 && <AGButton nm onClickEvent={() => handleResetTags()}>
            <p className="text-blue group-hover/button:font-medium">Clear tags</p>
          </AGButton>}
        </div>
      </div>

      {/* Display list of assets */}
      <div className="flex flex-wrap gap-6 w-full">
        {campaignAssets[activedOption as keyof CampaignAssetsInterface]
          ? handleFilterItems().map((asset: AssetType) => {
            return (
              <div key={asset.id}>
                <AssetCard id={asset.id} name={asset.name} thumb={asset.thumb} location={activedOption} />
              </div>
            )
          }) : <p>No Data to show</p>}
      </div>
    </>
  )
}