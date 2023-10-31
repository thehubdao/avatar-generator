import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GetInfoDB } from '../utils/firebase.util';
import { FirestoreLocation } from '../enums/firebase.enum';
import { CampaignAssets, CampaignParameters } from '../interfaces/common.interface';
import { AccessoryInterface, AnimationInterface, EnvMapInterface, FeatureInterface, StageInterface } from '../interfaces/api.interface';

interface CampaignStateInterface {
  name: string;
  parameters: CampaignParameters;
  assets: Partial<CampaignAssets>;
  isLoading: boolean;
  error?: string;
}

const initialState: CampaignStateInterface = {
  name: '',
  parameters: {
    owner: '',
    armature: '',
    features: undefined,
    accessories: undefined,
    config: {}
  },
  assets: {
    features: undefined,
    accessories: undefined,
    animations: undefined,
    stages: undefined,
    env_maps: undefined
  },
  isLoading: false,
  error: undefined
}

export const fetchData = createAsyncThunk(
  'currentCampaign/fetchData',

  async ({ campaign, location }: { campaign: string, location: FirestoreLocation }) => {
    const res = await GetInfoDB(location, campaign);
    const realRes = res.success ? res.value : [];
    
    return {
      res: realRes,
      location
    }
  }
)

export const currentCampaignSlice = createSlice({
  name: 'currentCampaign',
  initialState,
  reducers: {
    reset: () => initialState,
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchData.pending, (state) => {
      state.isLoading = true;
    })
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = `${FirestoreLocation.Parameters} info saved!`;
      switch (action.payload.location) {
        case FirestoreLocation.Parameters:
          state.parameters = action.payload.res.at(0) as CampaignParameters;
          break;
        case FirestoreLocation.Features:
          state.assets.features = action.payload.res as FeatureInterface[];
          break;
        case FirestoreLocation.Accessories:
          state.assets.accessories = action.payload.res as AccessoryInterface[];
          break;
        case FirestoreLocation.Animations:
          state.assets.animations = action.payload.res as AnimationInterface[];
          break;
        case FirestoreLocation.Stages:
          state.assets.stages = action.payload.res as StageInterface[];
          break;
        case FirestoreLocation.EnvMaps:
          state.assets.env_maps = action.payload.res as EnvMapInterface[];
          break;

        default:
          state.error = 'location dont match to fetch data';
          break;
      }
    })
    builder.addCase(fetchData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    })
  },
})

export const { reset, setName } = currentCampaignSlice.actions
export default currentCampaignSlice.reducer