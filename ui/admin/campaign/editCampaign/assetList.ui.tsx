import { useEffect, useState } from "react";
import AssetCard from "./assetCard.ui";
import { useAppSelector } from "../../../../store/hooks";
import { AssetType } from "../../../../types/asset.type";
import { FirestoreLocation } from "../../../../enums/firebase.enum";
import { FeatureBasic } from "../../../../interfaces/common.interface";
import { FeatureInterface } from "../../../../interfaces/api.interface";

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
  const campaignFeatures = useAppSelector(state => state.currentCampaign.parameters.features);

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

  //* Event handler for clicking on a suggested search item
  const handleOnClickSuggestionSearch = (itemName: string) => { setSearchByNameValue(itemName) }

  //* Event handler for keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' && selectedItem >= 0) {
      //* If ArrowUp key is pressed and selectedItem is greater than or equal to 0
      event.preventDefault();
      setSelectedItem(prev => (prev - 1));
    } else if (event.key === 'ArrowDown') {
      //* If ArrowDown key is pressed
      event.preventDefault();
      setSelectedItem(prev => (prev + 1) % searchFilteredList.length);
    } else if (event.key === 'Enter') {
      //* If Enter key is pressed
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
      {activedOption === 'features' && <div className="flex w-full h-full mb-10 justify-between mx-2">
        {/* By Name Searcher */}
        <div className="relative w-fit mr-5 text-sm">
          <input
            type="text"
            value={searchByNameValue}
            onChange={handleSearchByName}
            className="border-none outline-none w-72 p-1 px-3 rounded-md nm-inset-slate-100-sm selection:border-none"
            onKeyDown={handleKeyDown}
            placeholder="Search by name..."
            onBlur={handleBlur}
          />
          {showSuggestions && <div
            className={`absolute z-10 m-4 bg-slate-50 w-64 py-2 rounded-md shadow-2xl
            ${searchFilteredList.length == 0 ? 'hidden' : ''}`}
            onBlur={handleBlur}
          >
            {searchFilteredList.map((item, index) => {
              return <div
                onClick={() => handleOnClickSuggestionSearch(item.name)}
                onMouseEnter={() => {setSelectedItem(index)}}
                className={`px-2 ${selectedItem === index ? 'bg-orange  ' : ''}`}
                key={item.id}
              >{item.name}</div>
            })}
          </div>}
        </div>
        {/* By Tag Searcher */}
        <div className="flex flex-wrap gap-3 w-full">
          {campaignFeatures?.map((feature: FeatureBasic) => {
            return <button
              className={`px-2 rounded-md text-sm
              ${searchByTagValue.includes(feature.id) ? 'nm-inset-orange-sm font-semibold' : 'nm-flat-slate-100-sm'}
              transition-colors duration-300`}
              onClick={() => { handleSearchByTag(feature.id) }}
              key={feature.id}
            >{feature.val}</button>
          })}
        </div>
      </div>}

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