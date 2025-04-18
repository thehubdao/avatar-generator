import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CitizenMetadata, FollowUserData } from '../interfaces/citizens.interface';
import { Campaign } from '../enums/citizens/common.enum';
import { CampaignParameters } from '../interfaces/common.interface';
import { LeaderboardEntry } from '../types/leaderboard.type';
import { AppCampaigns, CampaignDrops } from '../types/citizens.type';

interface CitizensMetadataState {
  citizensMetadata: CitizenMetadata[] | null;
  selectedCampaign: Campaign | null;
  campaignParameters: CampaignParameters | null;
  selectedCitizen: CitizenMetadata | null;
  followUserData: FollowUserData | null;
  leaderboardData: LeaderboardEntry[] | null | undefined;
  userFeatures: CampaignDrops<AppCampaigns> | null;
}

const initialState: CitizensMetadataState = {
  citizensMetadata: null,
  selectedCampaign: null,
  campaignParameters: null,
  selectedCitizen: null, // Cannot be void string, only null or valid combination string
  followUserData: null,  // Both follower and following count are -1, meaning this blockchain does not support follow user data
  leaderboardData: null,
  userFeatures: null
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
    setCampaignParameters: (state, action: PayloadAction<CampaignParameters | null>) => {
      state.campaignParameters = action.payload;
    },
    setSelectedCitizen: (state, action: PayloadAction<CitizenMetadata>) => {
      state.selectedCitizen = action.payload;
    },
    setFollowUserData: (state, action: PayloadAction<FollowUserData>) => {
      state.followUserData = action.payload;
    },
    setLeaderboardData: (state, action: PayloadAction<LeaderboardEntry[] | undefined>) => {
      state.leaderboardData = action.payload;
    },
    setUserFeatures: (state, action: PayloadAction<CampaignDrops<AppCampaigns>>) => {
      state.userFeatures = action.payload;
    }
  }
});

export const { setCitizensMetadata, resetCitizensMetadata, setSelectedCampaign, setCampaignParameters, setSelectedCitizen, setFollowUserData, setLeaderboardData, setUserFeatures } = citizensMetadataSlice.actions;
export default citizensMetadataSlice.reducer;