import { createContext, useContext, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import { Signer } from '@futureverse/signer';

interface BlockchainContextType {
  provider: BrowserProvider | Signer | null;
}

const BlockchainContext = createContext<BlockchainContextType>({
  provider: null,
});

export const useBlockchainProvider = () => useContext(BlockchainContext);

interface BlockchainProviderProps {
  children: ReactNode;
  provider: BrowserProvider | Signer | null;
}

export function BlockchainProvider({ children, provider }: BlockchainProviderProps) {
  return (
    <BlockchainContext.Provider value={{ provider }}>
      {children}
    </BlockchainContext.Provider>
  );
} 