import { usePrivy } from '@privy-io/react-auth'
import { ethers, JsonRpcSigner } from 'ethers'
import { useEffect, useState } from 'react'
import { Drop } from '../../../interfaces/citizens.interface'
import { GetUserXPAndLevel } from '../../../utils/firebase.util'
import { ApproveClaimForUser } from '../../../utils/web3/drops.util'
import ClaimableDropABI from '../../../constants/abi/ClaimableDropABI.json'
import SelectorUI from './selector.ui'
import DropItemCard from './dropItemCard.ui'
import SearchSVG from './SVG/searchSVG.ui'
import { FetchClaimableDrops } from '../../../utils/api.util'
import { LogError } from '../../../utils/common.util'
import { Module } from '../../../enums/common.enum'

interface WearablesCollectionProps {
  signer: JsonRpcSigner | null
  handleUserFeatures: () => Promise<void>
}

export default function WearablesCollection({ signer, handleUserFeatures }: WearablesCollectionProps) {
  const { user } = usePrivy()

  const [claimableDrops, setClaimableDrops] = useState<Drop[]>([])
  const [userXP, setUserXP] = useState<number>(0)

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);



  const handleClaim = async (drop: Drop) => {
    if (!user?.wallet || !signer) return false;
    
    try {
      const isApproved = await ApproveClaimForUser(user.wallet.address, drop.id)
      setIsPopupOpen(true);
      if (!isApproved) {
        LogError(Module.Citizens, 'Error claiming drop: is not approved');
        return false;
      }
      const dropContract = new ethers.Contract(drop.contractAddress, ClaimableDropABI, signer)

      const claimTx = await dropContract.claim({
        gasLimit: 500000,
        value: drop.price ? ethers.parseEther(drop.price.toString()) : undefined
      })
      await claimTx.wait()

      const drops = await FetchClaimableDrops();
      setClaimableDrops(drops);
      await handleUserFeatures();
      setIsPopupOpen(false);
      return true;
    } catch (error) {
      LogError(Module.Citizens, 'Error claiming drop:', error);
      setIsPopupOpen(false);
      return false;
    }
  }

  useEffect(() => {
    if (user?.wallet?.address) {
      const fetchXPData = async () => {
        const xpData = await GetUserXPAndLevel(user?.wallet?.address || '')
        setUserXP(xpData.xp)
      }
      fetchXPData()
    }
  }, [user?.wallet?.address])

  useEffect(() => {
    async function fetchDrops() {
      const drops = await FetchClaimableDrops();
      setClaimableDrops(drops);
    }
    fetchDrops();
  }, []);

  return (
    <div className="container mx-auto pt-8">
      {/*  CITIZENS TABLE */}
      <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
        {/* TABLE HEADER */}
        <div className="w-full flex justify-between p-8 border-b border-white/20">
          {/* SEARCH BY NAME INPUT */}
          <label className="flex">
            <div className="flex justify-center items-center w-12 shadow-citizens-input rounded-l-full">
              <SearchSVG />
            </div>
            <div>
              <input
                type="text"
                name=""
                id=""
                placeholder="SEARCH BY NAME"
                className="w-80 bg-[#2D2D2D] text-lg text-white placeholder:text-white focus-visible:outline-none px-4 py-2 shadow-citizens-input rounded-r-full"
              />
            </div>
          </label>
          {/* SELECTORS */}
          <div className="flex gap-4">
            <SelectorUI label="OWNED" list={['Owned', 'Not Owned', 'All']} selectionHandler={() => { }} />
            <SelectorUI label="PRICE" list={['High to low', 'Low to High']} selectionHandler={() => { }} />
            <SelectorUI label="LEVEL" list={['LVL 01-10', 'LVL 01-10', 'LVL 10-20', 'LVL 20-30', 'LVL 30-40', 'LVL 40-50', 'LVL 50-60', 'LVL 60-70', 'LVL 70-80', 'LVL 80-90', 'LVL 90-100']} selectionHandler={() => { }} />
            <SelectorUI label="CHOOSE DROPS" list={['Chillwhales Head', 'Metaheads Hat', 'Platties Tee']} selectionHandler={() => { }} />
          </div>
        </div>
        {/* DROPS LIST */}
        <div className="grid grid-cols-4 gap-4 p-8">
          {claimableDrops.map((drop) => {
            return <DropItemCard
              key={drop.id} drop={drop}
              userXP={userXP}
              popupOpen={isPopupOpen}
              userAddress={user?.wallet?.address || ''}
              signer={signer as JsonRpcSigner}
              onClaim={() => handleClaim(drop)}
            />
          }
          )}
        </div>
      </div>
    </div>
  )
}