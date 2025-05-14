import { useLogin, useLogout, usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Blockchain, LoginLibrary } from '../enums/blockchain/common.enum';
import { resetCitizensMetadata, setCampaignParameters, setCitizensMetadata, setFollowUserData, setLeaderboardData, setMintingMode, setSelectedCampaign, setSelectedCitizen, setUserFeatures } from '../store/citizensMetadataSlice';
import { GetCampaignsTokensMetadata, GetFullLeaderboardData, GetUserFeatures } from '../utils/web3/lukso/contract.util';
import { CitizenMetadata } from '../interfaces/citizens.interface';
import { GetCollectionAssetByOwner } from '../utils/web3/solana/contract.util';
import { LogError, RemoveUndefinedProperties } from '../utils/common.util';
import { CampaignParameterName, Module } from '../enums/common.enum';
import { useDispatch } from 'react-redux';
import { Result } from '../types/common.type';
import { GetFollowerCounts, GetUniversalProfileData } from '../utils/web3/citizens.util';
import { BlockchainToWalletChainType } from '../utils/web3/web3.util';
import { Campaign, LuksoCampaign } from '../enums/citizens/common.enum';
import { connect, disconnect } from '../store/CitizensAuthSlice';
import { useAppSelector } from '../store/hooks';
import { GetParameter } from '../utils/firebase.util';
import { CampaignParameters } from '../interfaces/common.interface';
import { CampaignDrops, AppCampaigns } from '../types/citizens.type';
import { BrowserProvider } from 'ethers';
import { useAuthUi } from '@futureverse/auth-ui';
import { useAuth } from '@futureverse/auth-react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function useBlockchainWallet() {
  const dispatch = useDispatch();
  const isConnected = useAppSelector(state => state.citizensAuth.connected);
  const blockchainType = useAppSelector(state => state.citizensAuth.blockchainType);
  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);



  const getCampaignParams = async (campaign: Campaign) => {
    console.log("Getting campaign params for " + campaign);
    const campaignParams = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
    if (campaignParams.success) {
      dispatch(setCampaignParameters(RemoveUndefinedProperties(campaignParams.value)));
      dispatch(setSelectedCampaign(campaign));
    } else void LogError(Module.Citizens, 'Error on getting campaign parameters');
  }

  /* Tanto el blockchain como la campaña se seleccionan manualmente en cada boton que llama esta función */
  const HandleLogin = async (blockchain: Blockchain | undefined, campaign: Campaign | undefined) => {
  }

  const HandleLogout = async () => {
  }

  useEffect(() => {
    if(selectedCampaign == null)
      getCampaignParams(process.env.NEXT_PUBLIC_CAMPAIGN as Campaign); // Get the campaign parameters
  }, [selectedCampaign, isConnected]);


  return {
    HandleLogin,
    HandleLogout,
    ethersProvider: {}
  };
} 