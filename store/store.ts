import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import addCampaignSlice from './addCampaignSlice';
import currentCampaignSlice from './currentCampaignSlice';
import addAssetSlice from './addAssetSlice';
import citizensMetadataSlice from './citizensMetadataSlice';
import citizensAuthSlice from './CitizensAuthSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    addCampaign: addCampaignSlice,
    currentCampaign: currentCampaignSlice,
    addAsset: addAssetSlice,
    citizensMetadata: citizensMetadataSlice,
    citizensAuth: citizensAuthSlice,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;