import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Blockchain } from '../enums/blockchain/common.enum';
import { FollowUserData, UserXPData } from '../interfaces/citizens.interface';

export interface AuthState {
  connected: boolean | null;
  address: string | null;
  walletName: string | null;
  isHolder: boolean | null;
  profileImage?: string | null;
  blockchainType: Blockchain | null;
  xpData: UserXPData | null;
  followUserData: FollowUserData | null;
}

const initialState: AuthState = {
  connected: null,
  address: null,
  walletName: null,
  isHolder: null,
  profileImage: undefined,  // Optional, can be set later
  blockchainType: null,
  xpData: null,
  followUserData: null,  // Both follower and following count are -1, meaning this blockchain does not support follow user data
}

export const citizensAuthSlice = createSlice({
  name: 'citizensAuth',
  initialState,
  reducers: {
    connect: (state, action: PayloadAction<{address: string, walletName: string | null, blockchainType: Blockchain, xpData: UserXPData | null, followUserData: FollowUserData | null}>) => {
      state.connected = true;
      state.address = action.payload.address;
      state.walletName = action.payload.walletName;
      state.blockchainType = action.payload.blockchainType;
      state.xpData = action.payload.xpData;
      state.followUserData = action.payload.followUserData;
    },
    disconnect: (state) => {
      state.connected = false;
      state.address = null;
      state.walletName = null;
      state.blockchainType = null;
      state.xpData = null;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setBlockChainType: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setIsHolder: (state, action: PayloadAction<boolean | null>) => {
      state.isHolder = action.payload;
    },
  }
})

export const { connect, disconnect, setAddress, setIsHolder } = citizensAuthSlice.actions
export default citizensAuthSlice.reducer