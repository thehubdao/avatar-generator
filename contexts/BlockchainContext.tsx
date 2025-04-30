import { createContext, useContext, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import { Signer } from '@futureverse/signer';

interface BlockchainContextType {
  ethersProvider: BrowserProvider | null;
}

const BlockchainContext = createContext<BlockchainContextType>({
  ethersProvider: null,
});

export const useBlockchainProvider = () => useContext(BlockchainContext);

interface BlockchainProviderProps {
  children: ReactNode;
  ethersProvider: BrowserProvider | null;
}

export function BlockchainProvider({ children, ethersProvider }: BlockchainProviderProps) {
  return (
    <BlockchainContext.Provider value={{ ethersProvider }}>
      {children}
    </BlockchainContext.Provider>
  );
} 