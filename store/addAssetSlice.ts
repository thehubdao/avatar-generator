import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirestoreLocation } from '../enums/firebase.enum';

interface AssetStateInterface {
  location: string;
  type: string;
  name: string;
  ready: boolean;
  isUploading: boolean;
  error?: string;
}

const initialState: AssetStateInterface = {
  location: '',
  type: '',
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
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setReady: (state, action: PayloadAction<boolean>) => {
      state.ready = action.payload
    }
  }
})

export const { reset, setName, setType, setLocation, setReady } = addAssetSlice.actions
export default addAssetSlice.reducer