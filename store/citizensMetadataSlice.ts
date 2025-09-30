import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CitizenMetadata, FeatureClaimableDrop, MintingPriceData } from '../interfaces/citizens.interface';
import { Campaign, LuksoCampaign } from '../enums/citizens/common.enum';
import { BasicData, CampaignParameters } from '../interfaces/common.interface';
import { LeaderboardEntry } from '../types/leaderboard.type';
import { AppCampaigns, CampaignDrops } from '../types/citizens.type';

interface CitizensMetadataState {
  citizensMetadata: CitizenMetadata[] | null;
  selectedCampaign: Campaign | null;
  campaignParameters: CampaignParameters | null;
  selectedCitizen: CitizenMetadata | null;
  leaderboardData: LeaderboardEntry[] | null | undefined;
  userFeatures: CampaignDrops<AppCampaigns> | null;
  claimableDrops: Record<LuksoCampaign, FeatureClaimableDrop[]> | null;
  shoppingCart: BasicData[];
  mintSupply: number | null;
  mintingPrice: MintingPriceData | null;
  editMode: boolean;
  marketplaceMode: boolean;
  notificationMode: boolean;
  mintingMode: boolean;
  savingMode: boolean;
  checkoutMode: boolean;
  takingPhoto: boolean;
}

const initialState: CitizensMetadataState = {
  citizensMetadata: null,
  selectedCampaign: null,
  campaignParameters: null,
  selectedCitizen: null,
  leaderboardData: null,
  userFeatures: null,
  mintSupply: null,
  mintingPrice: null,
  claimableDrops: null,
  shoppingCart: [],
  editMode: false,
  marketplaceMode: false,
  notificationMode: false,
  mintingMode: true,
  savingMode: false,
  checkoutMode: false,
  takingPhoto: false,
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
    setLeaderboardData: (state, action: PayloadAction<LeaderboardEntry[] | undefined>) => {
      state.leaderboardData = action.payload;
    },
    setUserFeatures: (state, action: PayloadAction<CampaignDrops<AppCampaigns>>) => {
      state.userFeatures = action.payload;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.editMode = action.payload;
    },
    setMarketplaceMode: (state, action: PayloadAction<boolean>) => {
      state.marketplaceMode = action.payload;
    },
    setNotificationMode: (state, action: PayloadAction<boolean>) => {
      state.notificationMode = action.payload;
    },
    setMintingMode: (state, action: PayloadAction<boolean>) => {
      state.mintingMode = action.payload;
    },
    setSavingMode: (state, action: PayloadAction<boolean>) => {
      state.savingMode = action.payload;
    },
    setMintSupply: (state, action: PayloadAction<number | null>) => {
      state.mintSupply = action.payload;
    },
    setMintingPrice: (state, action: PayloadAction<MintingPriceData | null>) => {
      state.mintingPrice = action.payload;
    },
    setClaimableDrops: (state, action: PayloadAction<Record<Campaign, FeatureClaimableDrop[]>>) => {
      state.claimableDrops = action.payload;
    },
    setShoppingCart: (state, action: PayloadAction<BasicData[]>) => {
      state.shoppingCart = action.payload;
    },
    setCheckoutMode: (state, action: PayloadAction<boolean>) => {
      state.checkoutMode = action.payload;
    },
    setTakingPhoto: (state, action: PayloadAction<boolean>) => {
      state.takingPhoto = action.payload;
    }
  }
});

export const { setCitizensMetadata, resetCitizensMetadata, setSelectedCampaign, setCampaignParameters, setSelectedCitizen, setLeaderboardData, setUserFeatures, setEditMode, setMarketplaceMode, setNotificationMode, setMintingMode, setSavingMode, setMintSupply, setMintingPrice, setClaimableDrops, setShoppingCart, setCheckoutMode, setTakingPhoto } = citizensMetadataSlice.actions;
export default citizensMetadataSlice.reducer;