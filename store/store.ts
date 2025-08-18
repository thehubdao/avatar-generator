import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import addCampaignSlice from './addCampaignSlice';
import currentCampaignSlice from './currentCampaignSlice';
import addAssetSlice from './addAssetSlice';
import citizensMetadataSlice from './citizensMetadataSlice';
import citizensAuthSlice from './citizensAuthSlice';
import questSlice from './questSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    addCampaign: addCampaignSlice,
    currentCampaign: currentCampaignSlice,
    addAsset: addAssetSlice,
    citizensMetadata: citizensMetadataSlice,
    citizensAuth: citizensAuthSlice,
    quest: questSlice,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;