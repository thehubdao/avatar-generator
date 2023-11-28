import { FormEvent, KeyboardEvent, useState } from "react";
import AssetCard from "./assetCard.ui";
import { useAppSelector } from "../../../../store/hooks";
import { AssetType } from "../../../../types/asset.type";
import { FirestoreLocation } from "../../../../enums/firebase.enum";
import { IoMdAddCircleOutline } from "react-icons/io";
import { GoToPage } from "../../../../utils/router.util";
import { PageLocation } from "../../../../enums/common.enum";
import { CampaignAssets, FeatureBasic } from "../../../../interfaces/common.interface";
import { FeatureInterface } from "../../../../interfaces/api.interface";
import { AiOutlineCloseCircle } from "react-icons/ai";
import AGButton from "../../../common/ag-button.component";

interface AssetListProps {
  activedOption: FirestoreLocation;
  updateDefaultAsset: (element: string, config: string) => Promise<void>;
}

export default function AssetList({ activedOption, updateDefaultAsset }: AssetListProps) {
  //* Fetching campaign assets and features using custom hooks
  const campaignAssets = useAppSelector(state => state.currentCampaign.assets);
  const campaignTags = useAppSelector(state => {
    if (activedOption === ('features' || 'accessories'))
      return state.currentCampaign.parameters[activedOption]
    return []
  });

  //* State variables for search and filtering
  const [selectedItem, setSelectedItem] = useState<number>(-1);
  const [searchByNameValue, setSearchByNameValue] = useState<string>('');
  const [searchByTagValue, setSearchByTagValue] = useState<string[]>([]);
  const [searchSuggestionList, setSearchSuggestionList] = useState<AssetType[]>([]);
  const [shouldShowSuggestions, setShouldShowSuggestions] = useState<boolean>(false);

  // *Event handler for searching assets by name
  const handleSearchByName = (event: FormEvent<HTMLInputElement>) => {
    event.preventDefault()
    setShouldShowSuggestions(true)
    updateFilteredListData(event.currentTarget.value, searchByTagValue)
  }

  //* Updates the searchByTagValue state based on the provided tag.
  const handleSearchByTag = (tag: string) => {
    const updatedTags = searchByTagValue.includes(tag)
      ? searchByTagValue.filter((item) => item !== tag)
      : [...searchByTagValue, tag];

    updateFilteredListData(searchByNameValue, updatedTags);
  }

  //* handle reset search by tag value
  const handleResetTags = () => { updateFilteredListData(searchByNameValue, []) }

  //* Event handler for clicking on a suggested search item
  const handleOnClickSuggestionSearch = (itemName: string) => { updateFilteredListData(itemName, searchByTagValue) }

  //* Event handler for keyboard events
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' && selectedItem >= 0) {
      event.preventDefault();
      setSelectedItem(prev => (prev - 1));
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedItem(prev => (prev + 1) % searchSuggestionList.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // Get the name from the selected suggestion in the searchFilteredList or use the current searchByNameValue
      const name = searchSuggestionList[selectedItem]?.name ?? searchByNameValue;
      handleOnClickSuggestionSearch(name);
      setSelectedItem(-1);
    } else {
      // For any other key, reset the selectedItem to -1
      setSelectedItem(-1);
    }
  }

  //* Filters the items based on the search and tag filters.
  const handleFilterItems = () => {
    const listOfItemsByTag = (campaignAssets[activedOption as keyof CampaignAssets] as FeatureInterface[]).filter((asset: FeatureInterface) => {
      if (searchByTagValue.length > 0)
        return (searchByTagValue.includes(asset.type))
      return true
    })

    const listOfItems = listOfItemsByTag.filter((asset: AssetType) => {
      return asset.name.toLowerCase().includes(searchByNameValue.toLowerCase())
    })

    if (listOfItems.length > 0)
      return listOfItems
    return listOfItemsByTag
  }

  //* Hides the search suggestions in blur these components.
  const handleBlur = (switchShowSuggestTo: boolean) => {
    // Applies await delay if an on click is executed on an internal suggestion.
    setTimeout(() => {
      setShouldShowSuggestions(switchShowSuggestTo)
    }, 500)
  }

  //* Updates the filtered list of items based on the search and tag filters.
  const updateFilteredListData = (currentNameFilter: string, currentTagFilter: string[]) => {
    const filterItems = (campaignAssets[activedOption as keyof CampaignAssets] as FeatureInterface[])?.filter(item => {
      if (currentTagFilter.length > 0)
        return (currentTagFilter.includes(item.type))
      return true
    }).filter(item => {
      const searchTerm = currentNameFilter.toLowerCase()
      const itemName = item.name.toLowerCase()
      return searchTerm && itemName.includes(searchTerm) && itemName !== searchTerm
    }).slice(0, 10)

    setSearchByTagValue(currentTagFilter);
    setSearchByNameValue(currentNameFilter);
    setSearchSuggestionList(filterItems ?? []);
  }

  //* Updates default asset config prop.
  const handleUpdateDefaultAsset = (config: string) => {
    let defaultConfigKey = '';
    switch (activedOption) {
      case FirestoreLocation.Animations:
        defaultConfigKey = 'defAnimation';
        break;
      case FirestoreLocation.Stages:
        defaultConfigKey = 'defStage';
        break;
      default:
        break;
    }

    if (defaultConfigKey) {
      void updateDefaultAsset(defaultConfigKey, config);
    }
  };

  return (
    <>
      {/* Display list of assets */}
      <div className="flex flex-wrap gap-6 w-full">
        {campaignAssets[activedOption as keyof CampaignAssets]
          && (campaignAssets[activedOption as keyof CampaignAssets] as AssetType[]).length > 0
          ? <>
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
                    onBlur={() => handleBlur(false)}
                    onFocus={() => handleBlur(true)}
                  />
                  <div
                    className="absolute h-full flex justify-center items-center right-0 top-0 p-1 px-2 text-red cursor-pointer hover:scale-110 transition-all duration-100"
                    onClick={() => { updateFilteredListData('', searchByTagValue) }}
                  ><AiOutlineCloseCircle /></div>
                </div>
                {shouldShowSuggestions && <div className={`absolute z-10 m-4 bg-slate-50 w-64 py-2 rounded-md shadow-2xl ${searchSuggestionList.length == 0 ? 'hidden' : ''}`}>
                  {searchSuggestionList.map((item, index) => {
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
                {(campaignTags && campaignTags?.length > 0) && <>
                  {campaignTags?.map((tag: FeatureBasic, index: number) => {
                    return <AGButton
                      nm
                      selected={searchByTagValue.includes(tag.displayName)}
                      key={index}
                      onClickEvent={() => handleSearchByTag(tag.displayName)}
                    ><p className="group-hover/button:font-medium">{tag.displayName}</p></AGButton>
                  })}
                  <AGButton nm onClickEvent={() => handleResetTags()}>
                    <p className="text-blue group-hover/button:font-medium">Clear tags</p>
                  </AGButton>
                </>}
              </div>
            </div>
            {handleFilterItems().map((asset: AssetType) => {
              return (<div key={asset.id}>
                <AssetCard
                  id={asset.id}
                  name={asset.name}
                  thumb={asset.thumb}
                  location={activedOption}
                  updateDefaultAsset={(config: string) => handleUpdateDefaultAsset(config)}
                />
              </div>)
            })}
          </>
          : <div className="w-full mx-2 flex items-center gap-5">
            <p>{`No ${activedOption} to show`}</p>
            <AGButton nm onClickEvent={() => void GoToPage(PageLocation.AssetCreate)}>
              <div className={`flex items-center gap-2 p-2 font-poppins text-blue`}>
                <IoMdAddCircleOutline className="text-2xl" />
                <p>Add element</p>
              </div>
            </AGButton>
          </div>}
      </div>
    </>
  )
}