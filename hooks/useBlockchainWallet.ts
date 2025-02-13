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
  const {user} = usePrivy();
  const [blockchainType, setBlockchainType] = useState<BlockchainType>(BlockchainType.UNKNOWN);
  
  useEffect(() => {
    if (user?.wallet?.chainType ==BlockchainType.SOLANA) {
      setBlockchainType(BlockchainType.SOLANA);
    } else if (user?.wallet?.chainType ==BlockchainType.ETHEREUM) {

      setBlockchainType(BlockchainType.ETHEREUM);
    }
  }, [solanaWallets, ethWallets]);

  const getWalletAddress = () => {
    if (blockchainType === BlockchainType.SOLANA) {
      return solanaWallets[0]?.address.toString();
    }
    return ethWallets[0]?.address;
  };


  return {
    blockchainType,
    walletAddress: getWalletAddress(),
    isSolana: blockchainType === BlockchainType.SOLANA,
    isEthereum: blockchainType === BlockchainType.ETHEREUM,
    solanaWallets,
    ethWallets
  };
} 