import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { BrowserProvider } from 'ethers';
import { useEffect, useState, useRef } from 'react';
import { Blockchain } from '../enums/blockchain/common.enum';
import { setCitizensMetadata, setFollowUserData, setSelectedCombination } from '../store/citizensMetadataSlice';
import { GetCampaignsTokensMetadata } from '../utils/web3/lukso/contract.util';
import { CitizenMetadata } from '../interfaces/citizens.interface';
import { GetCollectionAssetByOwner } from '../utils/web3/solana/contract.util';
import { LogError } from '../utils/common.util';
import { CommonErrorCode, Module } from '../enums/common.enum';
import { useDispatch } from 'react-redux';
import { Result } from '../types/common.type';
import { GetFollowerCounts } from '../utils/web3/citizens.util';

export function useBlockchainWallet() {
  const blockchainType = useRef<Blockchain>();
  const dispatch = useDispatch();
  const { wallets: ethWallets } = useWallets();
  const { ready, user, authenticated } = usePrivy();
  const [provider, setProvider] = useState<BrowserProvider | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);

  const setBlockchain = () => {
    if (user?.wallet?.chainType == Blockchain.Solana) {
      blockchainType.current = Blockchain.Solana;
      setProvider(undefined);
    } else if (user?.wallet?.chainType == Blockchain.Ethereum) {
      blockchainType.current = Blockchain.Ethereum;
      ethWallets[0]?.getEthereumProvider().then(ethProvider => {
        const browserProvider = new BrowserProvider(ethProvider);
        setProvider(browserProvider);
      });
    }
  };

  async function getSolanaTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const asset = await GetCollectionAssetByOwner(walletAddress);

    if (asset.success) return { success: true, value: asset.value };

    return { success: false, errMessage: asset.errMessage, errCode: asset.errCode };
  };

  async function getEthereumTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const tokensMetadata = await GetCampaignsTokensMetadata(walletAddress);

    if (tokensMetadata.success) return { success: true, value: tokensMetadata.value };

    return { success: false, errMessage: tokensMetadata.errMessage, errCode: tokensMetadata.errCode };
  };

  const fetchCitizensMetadata = async (walletAddress: string) => {
    console.log("walletAddress", walletAddress, blockchainType.current);
    if (blockchainType.current === Blockchain.Ethereum) { // If the blockchain is Ethereum
      const ethereumCitizensMetadata = await getEthereumTokensMetadataPromise(walletAddress); // Get the citizens Ethereummetadata
      const followerCountResult = await GetFollowerCounts(walletAddress); // Get the follower count
      if (ethereumCitizensMetadata.success) { // If success, set the citizens metadata and selected combination
        dispatch(setCitizensMetadata(ethereumCitizensMetadata.value)); // Set the citizens metadata
        dispatch(setSelectedCombination(ethereumCitizensMetadata.value[0]?.combination)); // Set the selected combination
      } else { // If error, log the error, citizens metadata and selected combination will be null
        LogError(Module.Citizens, ethereumCitizensMetadata.errMessage, ethereumCitizensMetadata.errCode);
      }

      if (followerCountResult.success) { // If success, set the follow user data
        dispatch(setFollowUserData(followerCountResult.value));
      } else { // If error, log the error, follow user data will be null
        LogError(Module.Citizens, followerCountResult.errMessage, followerCountResult.errCode);
      }

    } else if (blockchainType.current === Blockchain.Solana) { // If the blockchain is Solana
      console.log("walletAddress", walletAddress, blockchainType.current);
      const solanaCitizensMetadata = await getSolanaTokensMetadataPromise(walletAddress); // Get the citizens Solana metadata
      if (solanaCitizensMetadata.success) { // If success, set the citizens metadata and selected combination
        dispatch(setCitizensMetadata(solanaCitizensMetadata.value)); // Set the citizens metadata
        dispatch(setSelectedCombination(solanaCitizensMetadata.value[0]?.combination)); // Set the selected combination
      } else { // If error, log the error, citizens metadata and selected combination will be null
        LogError(Module.Citizens, solanaCitizensMetadata.errMessage, solanaCitizensMetadata.errCode);
      }
      dispatch(setFollowUserData({ followerCount: -1, followingCount: -1 })); // Set the follow user data to -1, meaning this blockchain does not support follow user data
    }
  };

  useEffect(() => {
    if (ready && authenticated) {
      if (!user?.wallet?.address) {
        LogError(Module.Citizens, "User wallet address is undefined");
        return; //TODO: Add error handling
      }
      setBlockchain();
      fetchCitizensMetadata(user?.wallet?.address);
      setWalletAddress(user?.wallet?.address);
      setIsLoggedIn(true);
    }
    if (ready && !authenticated) {
      setIsLoggedIn(false);
    }
  }, [ready, authenticated, user]);

  return {
    blockchainType,
    walletAddress,
    provider,
    isLoggedIn
  };
} 