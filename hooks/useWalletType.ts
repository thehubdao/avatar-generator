import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';

export enum WalletType {
  SOLANA = 'solana',
  ETHEREUM = 'ethereum',
  UNKNOWN = 'unknown'
}

export function useWalletType() {
  const { user } = usePrivy();
  const { wallets: ethWallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();

  const getWalletType = (): WalletType => {
    // Si hay wallets de Solana conectadas
    if (solanaWallets && solanaWallets.length > 0) {
      return WalletType.SOLANA;
    }

    // Si hay wallets de Ethereum conectadas
    if (ethWallets && ethWallets.length > 0) {
      return WalletType.ETHEREUM;
    }

    return WalletType.UNKNOWN;
  };

  return {
    walletType: getWalletType(),
    isSolanaWallet: getWalletType() === WalletType.SOLANA,
    isEthereumWallet: getWalletType() === WalletType.ETHEREUM,
    solanaWallets,
    ethWallets
  };
}