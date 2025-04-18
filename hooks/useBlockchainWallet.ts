import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { Blockchain } from '../enums/blockchain/common.enum';
import { resetCitizensMetadata, setCampaignParameters, setCitizensMetadata, setFollowUserData, setLeaderboardData, setSelectedCampaign, setSelectedCitizen, setUserFeatures } from '../store/citizensMetadataSlice';
import { GetCampaignsTokensMetadata , GetUserFeatures } from '../utils/web3/lukso/contract.util';
import { CitizenMetadata } from '../interfaces/citizens.interface';
import { GetCollectionAssetByOwner } from '../utils/web3/solana/contract.util';
import { LogError, RemoveUndefinedProperties } from '../utils/common.util';
import { CampaignParameterName, Module } from '../enums/common.enum';
import { useDispatch } from 'react-redux';
import { Result } from '../types/common.type';
import { GetFollowerCounts } from '../utils/web3/citizens.util';
import { BlockchainToWalletChainType } from '../utils/web3/web3.util';
import { Campaign, LuksoCampaign, SolanaCampaign } from '../enums/citizens/common.enum';
import { connect, disconnect } from '../store/CitizensAuthSlice';
import { useAppSelector } from '../store/hooks';
import { GetParameter } from '../utils/firebase.util';
import { CampaignParameters } from '../interfaces/common.interface';
import { CampaignDrops, AppCampaigns } from '../types/citizens.type';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function useBlockchainWallet() {
  const dispatch = useDispatch();
  const isConnected = useAppSelector(state => state.citizensAuth.connected);
  const userAddress = useAppSelector(state => state.citizensAuth.address);
  const blockchainType = useAppSelector(state => state.citizensAuth.blockchainType);

  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const citizensMetadata = useAppSelector(state => state.citizensMetadata.citizensMetadata);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { ready, user, authenticated } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  const getCampaignParams = async (campaign: Campaign) => {
    const campaignParams = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
    if (campaignParams.success) {
      dispatch(setCampaignParameters(RemoveUndefinedProperties(campaignParams.value)));
    } else void LogError(Module.Citizens, 'Error on getting campaign parameters');
  }

  async function getSolanaTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const asset = await GetCollectionAssetByOwner(walletAddress);

    if (asset.success) return { success: true, value: asset.value };

    return { success: false, errMessage: asset.errMessage, errCode: asset.errCode };
  }

  async function getEthereumTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const tokensMetadata = await GetCampaignsTokensMetadata(walletAddress);

    if (tokensMetadata.success) return { success: true, value: tokensMetadata.value };

    return { success: false, errMessage: tokensMetadata.errMessage, errCode: tokensMetadata.errCode };
  }

  async function getEthereumUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<LuksoCampaign>>> {
    const features = await GetUserFeatures(walletAddress);

    if (features.success) return { success: true, value: features.value };

    return { success: false, errMessage: features.errMessage, errCode: features.errCode };
  }

  async function getSolanaUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<SolanaCampaign>>> {
    return { success: true, value: { [SolanaCampaign.Kumi]: [] } }; //TODO: Implement this function when solana campaign is fully ready
  }

  const fetchEthereumLeaderboardData = async () => {
    // TODO: Get the leaderboard data from utility and dispatch it to the store
    dispatch(setLeaderboardData(undefined));
  }

  const fetchCitizensMetadata = async (walletAddress: string) => {
    if (blockchainType === Blockchain.Ethereum) {
      const ethereumCitizensMetadata = await getEthereumTokensMetadataPromise(walletAddress); // Get the citizens Ethereum metadata
      const followerCountResult = await GetFollowerCounts(walletAddress); // Get the follower count
      const ethereumUserFeatures = await getEthereumUserFeaturesPromise(walletAddress); // Get the user features
      if (ethereumCitizensMetadata.success) {
        fetchEthereumLeaderboardData(); // Fetch the leaderboard data

        const citizen = ethereumCitizensMetadata.value.find(citizen => citizen.campaign === selectedCampaign); // Find the citizen with the selected campaign

        dispatch(setCitizensMetadata(ethereumCitizensMetadata.value));

        if (selectedCampaign === null) {
          const userCampaigns = [...new Set(ethereumCitizensMetadata.value.map(item => item.campaign))]; // Get the unique campaigns from the metadata

          if (userCampaigns.length > 0) {
            dispatch(setSelectedCampaign(userCampaigns[0]));
          } else {
            //TODO: Handle this case, go to minting here
          }

          dispatch(setSelectedCitizen(ethereumCitizensMetadata.value[0]));
        } else if (!citizen) {
          //TODO: Handle this case, go to minting here
          dispatch(setSelectedCitizen(ethereumCitizensMetadata.value[0]));
        } else {
          dispatch(setSelectedCitizen(citizen)); // Set the selected citizen to the one with the selected campaign
        }
      } else { // If error, log the error, citizens metadata and selected combination will be null
        LogError(Module.Citizens, ethereumCitizensMetadata.errMessage, ethereumCitizensMetadata.errCode);
      }

      if (followerCountResult.success) {
        dispatch(setFollowUserData(followerCountResult.value));
      } else { // If error, log the error, follow user data will be null
        LogError(Module.Citizens, followerCountResult.errMessage, followerCountResult.errCode);
      }

      if(ethereumUserFeatures.success) {
        const ethereumFeatures = ethereumUserFeatures.value as CampaignDrops<AppCampaigns>; // Cast the ethereum features to the AppCampaigns type, this depends on the wearables got for current campaign
        dispatch(setUserFeatures(ethereumFeatures));
      } else {
        LogError(Module.Citizens, ethereumUserFeatures.errMessage, ethereumUserFeatures.errCode);
      }

    } else if (blockchainType === Blockchain.Solana) {
      const solanaCitizensMetadata = await getSolanaTokensMetadataPromise(walletAddress); // Get the citizens Solana metadata

      if (solanaCitizensMetadata.success) {
        const citizen = solanaCitizensMetadata.value.find(citizen => citizen.campaign === selectedCampaign); // Find the citizen with the selected campaign

        dispatch(setCitizensMetadata(solanaCitizensMetadata.value));

        if (selectedCampaign === null) {
          const userCampaigns = [...new Set(solanaCitizensMetadata.value.map(item => item.campaign))]; // Get the unique campaigns from the metadata          
          if (userCampaigns.length > 0) {
            dispatch(setSelectedCampaign(userCampaigns[0]));
          } else {
            //TODO: Handle this case, go to minting here
          }

          dispatch(setSelectedCitizen(solanaCitizensMetadata.value[0]));
        } else if (!citizen) {
          //TODO: Handle this case, go to minting here
          dispatch(setSelectedCitizen(solanaCitizensMetadata.value[0]));
        } else {
          dispatch(setSelectedCitizen(citizen)); // Set the selected citizen to the one with the selected campaign
        }
      } else { // If error, log the error, citizens metadata and selected combination will be null
        LogError(Module.Citizens, solanaCitizensMetadata.errMessage, solanaCitizensMetadata.errCode);
      }
      dispatch(setFollowUserData({ followerCount: -1, followingCount: -1 })); // Set the follow user data to -1, meaning this blockchain does not support follow user data
    }
  };

  /* Tanto el blockchain como la campaña se seleccionan manualmente en cada boton que llama esta función */
  const HandleLogin = async (blockchain: Blockchain | undefined, campaign: Campaign | undefined) => {
    login({ walletChainType: BlockchainToWalletChainType(blockchain) });
    dispatch(setSelectedCampaign(campaign ?? null));
  }

  const HandleLogout = async () => {
    logout();
  }

  useEffect(() => {
    if (ready && authenticated) {
      if (user?.wallet) dispatch(connect({ address: user?.wallet?.address, blockchainType: user?.wallet?.chainType as Blockchain })); // Set the user as logged in
    }
    if (ready && !authenticated) {
      dispatch(disconnect());
    }
  }, [ready, authenticated]);

  useEffect(() => {
    if (isConnected === true) {
      if (citizensMetadata === null) {
        if (userAddress === null) {
          LogError(Module.Citizens, "User address is null, can't fetch citizens metadata");
          return;
        }
        fetchCitizensMetadata(userAddress);
      }
    }
    else if (isConnected === false) {
      // codigo necesario cuanedo el usuario se desconecta
      dispatch(resetCitizensMetadata());
    }
  }, [isConnected]);

  useEffect(() => {
    if (selectedCampaign !== null && isConnected === true) {
      getCampaignParams(selectedCampaign); // Get the campaign parameters
    }
  }, [selectedCampaign, isConnected]);

  return {
    HandleLogin,
    HandleLogout
  };
} 