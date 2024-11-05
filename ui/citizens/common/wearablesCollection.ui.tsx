import { useEffect, useState } from "react";
import DropItemCard from "./dropItemCard.ui";
import SelectorUI from "./selector.ui";
import SearchSVG from "./SVG/searchSVG.ui";
import { Drop } from "../../../interfaces/citizens.interface";
import { useConnectWallet } from "@web3-onboard/react";
import { EIP1193Provider } from "@web3-onboard/core";
import { ApproveClaimForUser, FetchClaimableDrops } from "../../../utils/api.util";
import { BrowserProvider, ethers } from "ethers";
import ClaimableDropABI from '../../../constants/abi/ClaimableDropABI.json';
import { GetUserXPAndLevel } from "../../../utils/firebase.util";

export default function WearablesCollection() {
  
  const [{ wallet }] = useConnectWallet();
  const [claimableDrops, setClaimableDrops] = useState<Drop[]>([]);
  const [userXP, setUserXP] = useState<number>(0);

  const handleClaim = async (drop: Drop) => {
    if (!wallet) return;

    try {
      // 1. Off-chain verification
      const isApproved = await ApproveClaimForUser(wallet.accounts[0].address, drop.id);
      if (!isApproved) {
        console.error('Claim not approved');
        return;
      }

      // 2. On-chain claim
      const provider = new BrowserProvider(wallet.provider);
      const signer = await provider.getSigner();
      const dropContract = new ethers.Contract(drop.contractAddress, ClaimableDropABI, signer);
      const claimTx = await dropContract.claim({
        gasLimit: 500000,
        value: drop.price ? ethers.parseEther(drop.price.toString()) : undefined
      });
      await claimTx.wait();


    } catch (error) {
      console.error('Error claiming drop:', error);
    }
  };

  useEffect(() => {
    if (wallet) {
      const xpData = async () => {
        const xpData = await GetUserXPAndLevel(wallet.accounts[0].address);
        setUserXP(xpData.xp);
      };
      xpData();
    }
  }, [wallet]);

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
          {claimableDrops.map((drop) => (
            <DropItemCard
              key={drop.id} drop={drop}
              userXP={userXP}
              userAddress={wallet?.accounts[0].address || ''}
              provider={wallet?.provider as EIP1193Provider}
              onClaim={() => handleClaim(drop)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}