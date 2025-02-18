import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { BrowserProvider } from 'ethers';
import { useEffect, useState } from 'react';

export enum BlockchainType {
  SOLANA = 'solana',
  ETHEREUM = 'ethereum',
  UNKNOWN = 'unknown'
}

export function useBlockchainWallet() {
  const { wallets: ethWallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { ready, logout: privyLogout, user, authenticated, } = usePrivy();
  const [blockchainType, setBlockchainType] = useState<BlockchainType>(BlockchainType.UNKNOWN);
  const [provider, setProvider] = useState<any>(undefined);

  useEffect(() => {
    if (!ready || provider) return;
    if (user?.wallet?.chainType == BlockchainType.SOLANA) {
      console.log(user, 'user')
      setBlockchainType(BlockchainType.SOLANA);
      setProvider({})
    } else if (user?.wallet?.chainType == BlockchainType.ETHEREUM) {
      console.log(user, 'user')
      setBlockchainType(BlockchainType.ETHEREUM);

      ethWallets[0]?.getEthereumProvider().then(ethProvider => {
        const browserProvider = new BrowserProvider(ethProvider);
        setProvider(browserProvider);
      });
    }

  }, [ready, solanaWallets, ethWallets]);

  const getWalletAddress = () => {
    if (blockchainType === BlockchainType.SOLANA) {
      return solanaWallets[0]?.address.toString();
    }
    return ethWallets[0]?.address;
  };

  const logout = () => {
    privyLogout();
    setProvider(undefined);
  }


  return {
    blockchainType,
    walletAddress: getWalletAddress(),
    isSolana: blockchainType === BlockchainType.SOLANA,
    isEthereum: blockchainType === BlockchainType.ETHEREUM,
    solanaWallets,
    ethWallets,
    provider,
    logout,
    authenticated
  };
} 