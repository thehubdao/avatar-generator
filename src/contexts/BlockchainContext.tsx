import { createContext, useContext } from 'react';
import { BlockchainContextType } from './types';

export const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);
// ... resto del código del contexto 