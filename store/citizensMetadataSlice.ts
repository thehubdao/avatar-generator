import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CitizenMetadata, FollowUserData } from '../interfaces/citizens.interface';
import { Campaign } from '../enums/citizens/common.enum';
import { CampaignParameters } from '../interfaces/common.interface';

interface CitizensMetadataState {
  citizensMetadata: CitizenMetadata[] | null;
  selectedCampaign: Campaign | null;
  CampaignParameters: CampaignParameters | null;
  selectedCitizen: CitizenMetadata | null;
  followUserData: FollowUserData | null;
}

const initialState: CitizensMetadataState = {
  citizensMetadata: null,
  selectedCampaign: null,
  CampaignParameters: null,
  selectedCitizen: null, // Cannot be void string, only null or valid combination string
  followUserData: null,  // Both follower and following count are -1, meaning this blockchain does not support follow user data
}

export const citizensMetadataSlice = createSlice({
  name: 'citizensMetadata',
  initialState,
  reducers: {
    resetCitizensMetadata: () => initialState,
    setCitizensMetadata: (state, action: PayloadAction<CitizenMetadata[]>) => {
      state.citizensMetadata = action.payload;
    },
    setSelectedCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaign = action.payload;
    },
    setCampaignParameters: (state, action: PayloadAction<CampaignParameters>) => {
      state.CampaignParameters = action.payload;
    },
    setSelectedCitizen: (state, action: PayloadAction<CitizenMetadata>) => {
      state.selectedCitizen = action.payload;
    },
    setFollowUserData: (state, action: PayloadAction<FollowUserData>) => {
      state.followUserData = action.payload;
    }
  }
});

export const { setCitizensMetadata, resetCitizensMetadata, setSelectedCampaign, setCampaignParameters, setSelectedCitizen, setFollowUserData } = citizensMetadataSlice.actions;
export default citizensMetadataSlice.reducer;