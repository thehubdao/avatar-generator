import { useLogin, useLogout, usePrivy, useSolanaWallets, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Blockchain } from '../enums/blockchain/common.enum';
import { resetCitizensMetadata, setCampaignParameters, setCitizensMetadata, setFollowUserData, setLeaderboardData, setSelectedCampaign, setSelectedCitizen, setUserFeatures } from '../store/citizensMetadataSlice';
import { GetCampaignsTokensMetadata, GetFullLeaderboardData, GetUserFeatures } from '../utils/web3/lukso/contract.util';
import { CitizenMetadata } from '../interfaces/citizens.interface';
import { GetCollectionAssetByOwner } from '../utils/web3/solana/contract.util';
import { LogError, RemoveUndefinedProperties } from '../utils/common.util';
import { CampaignParameterName, Module } from '../enums/common.enum';
import { useDispatch } from 'react-redux';
import { Result } from '../types/common.type';
import { GetFollowerCounts, GetUniversalProfileData } from '../utils/web3/citizens.util';
import { BlockchainToWalletChainType } from '../utils/web3/web3.util';
import { Campaign, LuksoCampaign, SolanaCampaign } from '../enums/citizens/common.enum';
import { connect, disconnect } from '../store/CitizensAuthSlice';
import { useAppSelector } from '../store/hooks';
import { GetParameter } from '../utils/firebase.util';
import { CampaignParameters } from '../interfaces/common.interface';
import { CampaignDrops, AppCampaigns } from '../types/citizens.type';
import { BrowserProvider } from 'ethers';
import { useAuthUi } from '@futureverse/auth-ui';
import { useAuth, useFutureverseSigner } from '@futureverse/auth-react';
import { Signer } from '@futureverse/signer';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function useBlockchainWallet() {
  const dispatch = useDispatch();
  const isConnected = useAppSelector(state => state.citizensAuth.connected);
  const userAddress = useAppSelector(state => state.citizensAuth.address);
  const blockchainType = useAppSelector(state => state.citizensAuth.blockchainType);

  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const citizensMetadata = useAppSelector(state => state.citizensMetadata.citizensMetadata);

  const signer = useFutureverseSigner();
  const { wallets: ethereumWallets, ready: ethereumReady } = useWallets(); //Privy Wallets
  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | null>(null);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { ready, user, authenticated } = usePrivy();
  const { userSession, isFetchingSession, signOutPass } = useAuth();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { openLogin } = useAuthUi();


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
    const leaderboardData = await GetFullLeaderboardData(userAddress as string);
    if (leaderboardData.success) {
      dispatch(setLeaderboardData(leaderboardData.value));
    } else {
      LogError(Module.Citizens, leaderboardData.errMessage, leaderboardData.errCode);
    }
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

      if (ethereumUserFeatures.success) {
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
    if (blockchain === Blockchain.Root) {
      openLogin();
    } else {
      login({ walletChainType: BlockchainToWalletChainType(blockchain) });
    }
    dispatch(setSelectedCampaign(campaign ?? null));
  }

  const HandleLogout = async () => {
    if (blockchainType === Blockchain.Root) {
      signOutPass({ flow: 'silent', disableConsent: true });
    } else {
      logout();
    }
  }

  //Privy Logic
  useEffect(() => {
    if (ready && authenticated) {
      if (user?.wallet) {
        const connectPromise = async () => {
          const chainType = user?.wallet?.chainType as Blockchain;

          if (user?.wallet?.address === undefined) {
            LogError(Module.Citizens, "User address is undefined, can't connect to blockchain");
            return; // If the user address is undefined, log the error and return
          }

          if (chainType === Blockchain.Ethereum && ethereumReady) {
            const provider = await ethereumWallets[0].getEthereumProvider(); // Get the ethereum provider
            const walletName = await GetUniversalProfileData(user?.wallet?.address); // Get the wallet name
            setEthersProvider(new BrowserProvider(provider)); // Cast to BrowserProvider and set the provider

            if (walletName.success) {
              dispatch(connect({ address: user?.wallet?.address, walletName: walletName.value.name, blockchainType: chainType }));
            } else {
              dispatch(connect({ address: user?.wallet?.address, walletName: null, blockchainType: chainType }));
            }

          } else if (chainType === Blockchain.Solana) {
            //TODO: Set provider to solana provider
            dispatch(connect({ address: user?.wallet?.address, walletName: null, blockchainType: chainType }));
          }
        }
        connectPromise();
      } // Set the user as logged in
    }
    if (ready && !authenticated && (blockchainType === Blockchain.Ethereum || blockchainType === Blockchain.Solana)) { //We don't need the blockchain type as use effect dependency because to be connected, blockchain type must be defined
      dispatch(disconnect());
    }
  }, [ready, authenticated, ethereumReady]);

  //Root Logic
  useEffect(() => {
    if (!isFetchingSession && userSession) {
      dispatch(connect({ address: userSession.linked[0].eoa, walletName: null, blockchainType: Blockchain.Root }));
    }
    if (!isFetchingSession && !userSession && blockchainType === Blockchain.Root) { //We don't need the blockchain type as use effect dependency because to be connected, blockchain type must be defined
      dispatch(disconnect());
    }
  }, [isFetchingSession, userSession]);

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
    HandleLogout,
    ethersProvider
  };
} 