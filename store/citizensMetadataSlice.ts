import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CitizenMetadata } from '../interfaces/citizens.interface';
import { Campaign } from '../enums/citizens/common.enum';

interface CitizensMetadataState {
  citizensMetadata: CitizenMetadata[] | null;
  selectedCampaign: Campaign | null;
  selectedCombination: string | null;
}

const initialState: CitizensMetadataState = {
  citizensMetadata: null,
  selectedCampaign: null,
  selectedCombination: null, // Cannot be void string, only null or valid combination string
}

export const citizensMetadataSlice = createSlice({
  name: 'citizensMetadata',
  initialState,
  reducers: {
    resetCitizensMetadata: () => initialState,
    setCitizensMetadata: (state, action: PayloadAction<CitizenMetadata[]>) => {
      state.citizensMetadata = action.payload;
    },
    setSelectedCampaign: (state, action: PayloadAction<Campaign>) => {
      state.selectedCampaign = action.payload;
    },
    setSelectedCombination: (state, action: PayloadAction<string>) => {
      state.selectedCombination = action.payload;
    }
  }
});

export const { setCitizensMetadata, resetCitizensMetadata, setSelectedCampaign, setSelectedCombination } = citizensMetadataSlice.actions;
export default citizensMetadataSlice.reducer;