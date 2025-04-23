import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Blockchain } from '../enums/blockchain/common.enum';
import { BrowserProvider } from 'ethers';

export interface AuthState {
  connected: boolean | null;
  address: string | null;
  blockchainType: Blockchain | null;
  provider: BrowserProvider | null;
}

const initialState: AuthState = {
  connected: null,
  address: null,
  blockchainType: null,
  provider: null,
}

export const citizensAuthSlice = createSlice({
  name: 'citizensAuth',
  initialState,
  reducers: {
    connect: (state, action: PayloadAction<{address: string, blockchainType: Blockchain, provider: BrowserProvider | null}>) => {
      state.connected = true;
      state.address = action.payload.address;
      state.blockchainType = action.payload.blockchainType;
      state.provider = action.payload.provider;
    },
    disconnect: (state) => {
      state.connected = false;
      state.address = null;
      state.blockchainType = null;
      state.provider = null;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setBlockChainType: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
  }
})

export const { connect, disconnect, setAddress } = citizensAuthSlice.actions
export default citizensAuthSlice.reducer