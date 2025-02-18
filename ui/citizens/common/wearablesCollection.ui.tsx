import { usePrivy } from '@privy-io/react-auth'
import { JsonRpcProvider } from 'ethers'
import { useEffect, useState } from 'react'
import { GetUserXPAndLevel } from '../../../utils/firebase.util'
import SelectorUI from './selector.ui'
import DropItemCard from './dropItemCard.ui'
import SearchSVG from './SVG/searchSVG.ui'
import { DataBaseDrop } from '../../../interfaces/citizens.interface'

interface WearablesCollectionProps {
  provider: JsonRpcProvider | null
  claimableDrops: DataBaseDrop[]
  handleClaim: (drop: DataBaseDrop) => Promise<boolean>
}

export default function WearablesCollection({ 
  provider, 
  claimableDrops,
  handleClaim 
}: WearablesCollectionProps) {
  const { user } = usePrivy()
  const [userXP, setUserXP] = useState<number>(0)

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  const [choosePriceValue, setChoosePriceValue] = useState<string | undefined>();
  const [chooseOwnedValue, setChooseOwnedValue] = useState<string | undefined>();
  const [chooseLevelValue, setChooseLevelValue] = useState<string | undefined>();

  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleClaimWithPopup = async (drop: DataBaseDrop) => {
    setIsPopupOpen(true);
     await handleClaim(drop);
    setIsPopupOpen(false);
    return true;
  };

  useEffect(() => {
    if (user?.wallet?.address) {
      const fetchXPData = async () => {
        const xpData = await GetUserXPAndLevel(user?.wallet?.address || '')
        setUserXP(xpData.xp)
      }
      fetchXPData()
    }
  }, [user?.wallet?.address])


  const getFilteredDrops = () => {
    return claimableDrops.filter(drop => {
      const didMatchSearch = drop.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const didMatchOwned = !chooseOwnedValue || chooseOwnedValue === 'All' 
        ? true 
        : chooseOwnedValue === 'Owned' 
          ? drop.owned 
          : !drop.owned;
      
      const didMatchLevel = !chooseLevelValue 
        ? true 
        : isInLevelRange(drop.requiredXP, chooseLevelValue);
      
      return didMatchSearch && didMatchOwned && didMatchLevel;
    }).sort((a, b) => {
      if (choosePriceValue === 'High to low') {
        return (b.price || 0) - (a.price || 0);
      } else if (choosePriceValue === 'Low to High') {
        return (a.price || 0) - (b.price || 0);
      }
      return 0;
    });
  };

  const isInLevelRange = (xp: number, levelRange: string) => {
    if (levelRange === 'All') return true;
    
    const [start, end] = levelRange
      .replace('LVL ', '')
      .split('-')
      .map(num => parseInt(num));
    
    const level = Math.floor(xp / 100);
    return level >= start && level <= end;
  };

  return (
    <div className="container mx-auto xl:pt-8 px-6 2xl:px-0">
      {/* TABLE */}
      <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
        {/* TABLE HEADER */}
        <div className="w-full flex flex-col xl:flex-row justify-between p-4 sm:p-8 border-b border-white/20">
          {/* SEARCH BY NAME INPUT */}
          <label className="flex w-full xl:w-auto">
            <div className="flex justify-center items-center w-12 shadow-citizens-input rounded-l-full">
              <SearchSVG />
            </div>
            <div className='w-full xl:w-auto'>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH BY NAME"
                className="w-full xl:w-80 bg-[#2D2D2D] text-lg text-white placeholder:text-white focus-visible:outline-none px-4 py-2 shadow-citizens-input rounded-r-full"
              />
            </div>
          </label>
          {/* SELECTORS */}
          <div className="flex lg:gap-4 justify-between lg:justify-center pt-6 xl:pt-0">
            <SelectorUI label="OWNED" list={['Owned', 'Not Owned', 'All']} selectionHandler={(value) => { setChooseOwnedValue(value) }} selection={chooseOwnedValue} />
            <SelectorUI label="PRICE" list={['High to low', 'Low to High']} dropDownPosition='left-1/2 -translate-x-1/2' selectionHandler={(value) => { setChoosePriceValue(value) }} selection={choosePriceValue} />
            <SelectorUI label="LEVEL" list={['All','LVL 0-10', 'LVL 10-20', 'LVL 20-30', 'LVL 30-40', 'LVL 40-50', 'LVL 50-60', 'LVL 60-70', 'LVL 70-80', 'LVL 80-90', 'LVL 90-100']} dropDownPosition='right-0' selectionHandler={(value) => { setChooseLevelValue(value) }} selection={chooseLevelValue} />
          </div>
        </div>
        {/* DROPS LIST */}
        <div className="flex flex-wrap justify-center xl:justify-start gap-4 p-8">
          {getFilteredDrops().map((drop) => {
            const isLock = userXP < drop.requiredXP;
            return <DropItemCard
              key={drop.id}
              drop={drop}
              userXP={userXP}
              popupOpen={isPopupOpen}
              userAddress={user?.wallet?.address || ''}
              provider={provider as JsonRpcProvider}
              onClaim={() => handleClaimWithPopup(drop)}
              isLock={isLock}
            />
          })}
        </div>
      </div>
    </div>
  )
}