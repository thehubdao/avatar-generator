import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssetType } from '../types/asset.type';
import { GetInfoDB } from '../utils/firebase.util';
import { FirestoreLocation } from '../enums/firebase.enum';
import { CampaignParameters } from '../interfaces/common.interface';

interface CampaignStateInterface {
  name: string,
  parameters: CampaignParameters,
  assets: {
    features?: AssetType[],
    accessories?: AssetType[],
    animations?: AssetType[],
    environments?: AssetType[]
  },
  isLoading: boolean,
  error?: string,
}

const initialState: CampaignStateInterface = {
  name: '',
  parameters: {
    owner: '',
    armature: '',
    features: undefined,
    accessories: undefined,
    config: undefined
  },
  assets: {
    features: undefined,
    accessories: undefined,
    animations: undefined,
    environments: undefined
  },
  isLoading: false,
  error: undefined
}

export const fetchData = createAsyncThunk(
  'currentCampaign/fetchData',

  async ({ campaign, location }: { campaign: string, location: FirestoreLocation }) => {
    // let res;
    // if (location === FirestoreLocation.Parameters) {
    //   res = await GetInfoDB<CampaignParameters>(location, campaign);
    // } else {
    //   res = await GetInfoDB<AssetType>(location, campaign);
    // }
    const res = await GetInfoDB(location, campaign);
    return {
      res,
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
      if (action.payload.location === FirestoreLocation.Parameters) state.parameters = action.payload.res[0] as CampaignParameters;
      else state.assets[action.payload.location] = action.payload.res as AssetType[];
      state.error = 'everything is done!';
    })
    builder.addCase(fetchData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    })
  },
})

export const { reset, setName } = currentCampaignSlice.actions
export default currentCampaignSlice.reducer