import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirestoreLocation } from '../enums/firebase.enum';

interface AssetStateInterface {
  location: string;
  storage: string;
  name: string;
  ready: boolean;
  isUploading: boolean;
  error?: string;
}

const initialState: AssetStateInterface = {
  location: '',
  storage: '',
  name: '',
  ready: false,
  isUploading: false,
  error: undefined
}

export const addAssetSlice = createSlice({
  name: 'addAsset',
  initialState,
  reducers: {
    reset: () => initialState,
    setLocation: (state, action: PayloadAction<FirestoreLocation>) => {
      state.location = action.payload
    },
    setStorage: (state, action: PayloadAction<string>) => {
      state.storage = action.payload
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setReady: (state, action: PayloadAction<boolean>) => {
      state.ready = action.payload
    }
  }
})

export const { reset, setName, setStorage, setLocation, setReady } = addAssetSlice.actions
export default addAssetSlice.reducer