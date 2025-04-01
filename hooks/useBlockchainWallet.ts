import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { BrowserProvider } from 'ethers';
import { useEffect, useState, useRef } from 'react';
import { Blockchain } from '../enums/blockchain/common.enum';
import { setCitizensMetadata, setSelectedCombination } from '../store/citizensMetadataSlice';
import { getCampaignsTokensMetadata } from '../utils/web3/lukso/contract.util';
import { CitizenMetadata } from '../interfaces/citizens.interface';
import { getCollectionAssetByOwner } from '../utils/web3/solana/contract.util';
import { LogError } from '../utils/common.util';
import { Module } from '../enums/common.enum';
import { useDispatch } from 'react-redux';

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
      setProvider(undefined)
    } else if (user?.wallet?.chainType == Blockchain.Ethereum) {
      blockchainType.current = Blockchain.Ethereum;
      ethWallets[0]?.getEthereumProvider().then(ethProvider => {
        const browserProvider = new BrowserProvider(ethProvider);
        setProvider(browserProvider);
      });
    }
  }

  const getSolanaTokensMetadataPromise = async (walletAddress: string) => {
    const asset = await getCollectionAssetByOwner(walletAddress)
    
    if (asset.success) return [asset.value as unknown as CitizenMetadata]

    return []
  }

  const getEthereumTokensMetadataPromise = async (walletAddress: string) => {
    const tokensMetadata = await getCampaignsTokensMetadata(walletAddress)

    if (tokensMetadata.success) return tokensMetadata.value

    return []
  }

  const fetchCitizensMetadata = async (walletAddress: string) => {
    if (blockchainType.current === Blockchain.Ethereum) {
      const ethereumCitizensMetadata = await getEthereumTokensMetadataPromise(walletAddress);
      dispatch(setCitizensMetadata(ethereumCitizensMetadata));
      dispatch(setSelectedCombination(ethereumCitizensMetadata[0]?.combination)); // null in case of error. This means user has no avatars
    } else if (blockchainType.current === Blockchain.Solana) {
      const solanaCitizensMetadata = await getSolanaTokensMetadataPromise(walletAddress);
      dispatch(setCitizensMetadata(solanaCitizensMetadata));
      dispatch(setSelectedCombination(solanaCitizensMetadata[0]?.combination)); // null in case of error. This means user has no avatars
    }


  }

  useEffect(() => {
    if (ready && authenticated) {
      if (!user?.wallet?.address) {
        LogError(Module.Citizens, "User wallet address is undefined");
        return //TODO: Add error handling
      }
      setBlockchain();
      fetchCitizensMetadata(user?.wallet?.address);
      setWalletAddress(user?.wallet?.address);
      setIsLoggedIn(true);
    }
    if (ready && !authenticated) {
      setIsLoggedIn(false);
    }

  }, [ready, authenticated]);

  return {
    blockchainType,
    walletAddress,
    provider,
    isLoggedIn
  };
} 