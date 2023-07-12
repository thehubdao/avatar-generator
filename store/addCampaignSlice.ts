import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureBasic } from '../interfaces/common.interface';

interface CampaignStateInterface {
  name: string;
  features: FeatureBasic[];
  ready: boolean;
  isUploading: boolean;
  error?: string;
}

const initialState: CampaignStateInterface = {
  name: '',
  features: [],
  ready: false,
  isUploading: false,
  error: undefined
}

export const addCampaignSlice = createSlice({
  name: 'addCampaign',
  initialState,
  reducers: {
    reset: () => initialState,
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setFeatures: (state, action: PayloadAction<FeatureBasic[]>) => {
      state.features = action.payload
    },
    setReady: (state, action: PayloadAction<boolean>) => {
      state.ready = action.payload
    }
  }
})

export const { reset, setName, setFeatures, setReady } = addCampaignSlice.actions
export default addCampaignSlice.reducer