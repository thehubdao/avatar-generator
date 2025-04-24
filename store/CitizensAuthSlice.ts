import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Blockchain } from '../enums/blockchain/common.enum';

export interface AuthState {
  connected: boolean | null;
  address: string | null;
  walletName: string | null;
  blockchainType: Blockchain | null;
}

const initialState: AuthState = {
  connected: null,
  address: null,
  walletName: null,
  blockchainType: null,
}

export const citizensAuthSlice = createSlice({
  name: 'citizensAuth',
  initialState,
  reducers: {
    connect: (state, action: PayloadAction<{address: string, walletName: string | null, blockchainType: Blockchain}>) => {
      state.connected = true;
      state.address = action.payload.address;
      state.walletName = action.payload.walletName;
      state.blockchainType = action.payload.blockchainType;
    },
    disconnect: (state) => {
      state.connected = false;
      state.address = null;
      state.blockchainType = null;
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