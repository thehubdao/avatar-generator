import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CampaignConfig, ColorConfig, FeatureBasic } from '../interfaces/common.interface';

interface CampaignStateInterface {
  name: string;
  features: FeatureBasic[];
  config: Partial<CampaignConfig>;
  isLoading: boolean;
  error?: string;
}

const initialState: CampaignStateInterface = {
  name: '',
  features: [],
  config: {
    defCam: {
      lookAt: { x: 0, y: 0, z: 0 },
      pos: { x: 0, y: 1, z: 3.5 },
    }
  },
  isLoading: false,
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
    setSkin: (state, action: PayloadAction<Partial<ColorConfig>>) => {
      state.config.skin = action.payload
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  }
})

export const { reset, setName, setFeatures, setSkin, setIsLoading } = addCampaignSlice.actions
export default addCampaignSlice.reducer