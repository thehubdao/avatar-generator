import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserInterface } from '../interfaces/firebase.interface';
import { AuthStateInterface } from '../interfaces/common.interface';

const initialState: AuthStateInterface = {
  connected: false,
  userInfo: undefined,
  address: undefined
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    connect: (state) => {
      state.connected = true;
    },
    disconnect: () => initialState,
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
    setUserInfo: (state, action: PayloadAction<UserInterface | undefined>) => {
      state.userInfo = action.payload
    },
  }
})

export const { connect, disconnect, setAddress, setUserInfo } = authSlice.actions
export default authSlice.reducer