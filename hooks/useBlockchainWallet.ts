import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
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
    if (!ready) return;
    if (user?.wallet?.chainType == BlockchainType.SOLANA) {
      setBlockchainType(BlockchainType.SOLANA);
      setProvider({})
    } else if (user?.wallet?.chainType == BlockchainType.ETHEREUM) {
      setBlockchainType(BlockchainType.ETHEREUM);
      ethWallets[0]?.getEthereumProvider().then(setProvider);
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