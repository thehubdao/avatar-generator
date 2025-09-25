import { useLogin, useLogout, usePrivy, useSolanaWallets, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Blockchain, LoginLibrary } from '../enums/blockchain/common.enum';
import { resetCitizensMetadata, setCampaignParameters, setCitizensMetadata, setClaimableDrops, setLeaderboardData, setMintingMode, setMintingPrice, setMintSupply, setNotificationMode, setSelectedCampaign, setSelectedCitizen, setUserFeatures } from '../store/citizensMetadataSlice';
import { GetCampaignsTokensMetadata, GetFullLeaderboardData, GetLuksoUserFeatures } from '../utils/web3/lukso/contract.util';
import { GetCampaignCitizensMetadata, GetCollectionSupply, GetMintingPrice, GetSolanaUserFeatureAssets, InitializeUmi } from '../utils/web3/solana/contract.util';
import { CitizenMetadata, ClaimableDrop, FollowUserData, MintingData } from '../interfaces/citizens.interface';
import { LogError, RemoveUndefinedProperties } from '../utils/common.util';
import { CampaignParameterName, Module } from '../enums/common.enum';
import { useDispatch } from 'react-redux';
import { Result } from '../types/common.type';
import { GetFollowerCounts, GetUniversalProfileData } from '../utils/web3/citizens.util';
import { BlockchainToWalletChainType, GetSdkConnection, SetSdkConnection, GetSelectedCampaign, SetSelectedCampaign } from '../utils/web3/web3.util';
import { Campaign, LuksoCampaign, SolanaCampaign, CampaignBaseCombination, RootCampaign, PolygonCampaign } from '../enums/citizens/common.enum';
import { connect, disconnect, setIsHolder } from '../store/citizensAuthSlice';
import { useAppSelector } from '../store/hooks';
import { GetParameter, TrackCampaignUsage, TrackDailyActiveUser } from '../utils/firebase.util';
import { CampaignParameters } from '../interfaces/common.interface';
import { CampaignDrops, AppCampaigns } from '../types/citizens.type';
import { BrowserProvider } from 'ethers';
import { useAuthUi } from '@futureverse/auth-ui';
import { useAuth, useFutureverseSigner } from '@futureverse/auth-react';
import { GetUserXPData } from '../utils/api.util';
import { LeaderboardEntry } from '../types/leaderboard.type';
import { GetLuksoClaimableDrops } from '../utils/web3/lukso/lukso.util';
import { GetRootAssetsMetadata, GetRootCollectionSupply, GetRootMintingPrice, GetRootUserFeatureAssets } from '../utils/web3/root/contract.util';
import { InitializeContractEssentialData } from '../constants/root/contract.constant';
import { GetCampaignsPolygonTokensMetadata, GetPolygonCollectionSupply, GetPolygonUserFeatureAssets } from '../utils/web3/polygon/contract.util';
import { InitializePolygonContractEssentialData } from '../constants/polygon/contract.constant';
import { NETWORK_CONFIGS } from '../constants/common.constant';

export function useBlockchainWallet() {
  const dispatch = useDispatch();
  const isConnected = useAppSelector(state => state.citizensAuth.connected);
  const userAddress = useAppSelector(state => state.citizensAuth.address);
  const blockchainType = useAppSelector(state => state.citizensAuth.blockchainType);

  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const citizensMetadata = useAppSelector(state => state.citizensMetadata.citizensMetadata);

  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | null>(null);

  /* Fetching related hooks */
  const { ready, user, authenticated, isModalOpen } = usePrivy(); //Privy Auth
  const { userSession, isFetchingSession, signOutPass } = useAuth(); //Pass Auth

  /* Login and Logout related hooks */
  const { login } = useLogin(); //Privy Login
  const { logout } = useLogout(); //Privy Logout

  const { openLogin } = useAuthUi(); //Futureverse Login

  /* Signer related hooks */

  const { wallets: ethereumWallets, ready: isEthereumReady } = useWallets(); //Privy Ethereum Wallets
  const { wallets: solanaWallets, ready: isSolanaReady } = useSolanaWallets(); //Privy Solana Wallets   

  const signer = useFutureverseSigner();

  const getCampaignParams = async (campaign: Campaign) => {
    const campaignParams = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
    if (campaignParams.success) {
      dispatch(setCampaignParameters(RemoveUndefinedProperties(campaignParams.value)));
    } else void LogError(Module.Citizens, 'Error on getting campaign parameters');
  }

  const trackCampaignUsageAsync = async (campaign: Campaign | null) => {
    if (campaign) {
      try {
        const result = await TrackCampaignUsage(campaign.toLowerCase());
        if (!result.success) {
          LogError(Module.Citizens, 'Error tracking campaign usage:', result.errMessage);
        }
      } catch (error) {
        LogError(Module.Citizens, 'Error tracking campaign usage:', error);
      }
    }
  }

  const trackCampaignAndSessionAsync = async (campaign: Campaign | null) => {
    try {
      // Track campaign usage and daily active user in parallel
      const dailyActivePromise = TrackDailyActiveUser();
      const campaignPromise = campaign ? TrackCampaignUsage(campaign.toLowerCase()) : Promise.resolve({ success: true, value: true });
      
      const [dailyActiveResult, campaignResult] = await Promise.all([
        dailyActivePromise, 
        campaignPromise
      ]);
      
      if (!dailyActiveResult.success) {
        LogError(Module.Citizens, 'Error tracking daily active user:', dailyActiveResult.errMessage);
      }
      
      if (campaign && !campaignResult.success) {
        LogError(Module.Citizens, 'Error tracking campaign usage:', (campaignResult as any).errMessage);
      }
    } catch (error) {
      LogError(Module.Citizens, 'Error tracking campaign and session statistics:', error);
    }
  }

  async function getSolanaTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const asset = await GetCampaignCitizensMetadata(walletAddress);

    if (asset.success) return { success: true, value: asset.value };

    return { success: false, errMessage: asset.errMessage, errCode: asset.errCode };
  }

  async function getLuksoTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const tokensMetadata = await GetCampaignsTokensMetadata(walletAddress);

    if (tokensMetadata.success) return { success: true, value: tokensMetadata.value };

    return { success: false, errMessage: tokensMetadata.errMessage, errCode: tokensMetadata.errCode };
  }

  async function getPolygonTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const tokensMetadata = await GetCampaignsPolygonTokensMetadata(walletAddress);
    if (tokensMetadata.success) return { success: true, value: tokensMetadata.value };
    return { success: false, errMessage: tokensMetadata.errMessage, errCode: tokensMetadata.errCode };
  }

  async function getRootTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const asset = await GetRootAssetsMetadata(walletAddress);
    if (asset.success) return { success: true, value: asset.value };

    return { success: false, errMessage: asset.errMessage, errCode: asset.errCode };
  }

  async function getLuksoUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<LuksoCampaign>>> {
    const features = await GetLuksoUserFeatures(walletAddress);

    if (features.success) return { success: true, value: features.value };

    return { success: false, errMessage: features.errMessage, errCode: features.errCode };
  }

  async function getSolanaUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<SolanaCampaign>>> {
    const features = await GetSolanaUserFeatureAssets(walletAddress, SolanaCampaign.Kumi);

    if (features.success) return { success: true, value: features.value };

    return { success: false, errMessage: features.errMessage, errCode: features.errCode };
  }

  async function getPolygonUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<PolygonCampaign>>> {
    const features = await GetPolygonUserFeatureAssets(walletAddress, PolygonCampaign.Polygon);

    if (features.success) return { success: true, value: features.value };

    return { success: false, errMessage: features.errMessage, errCode: features.errCode };
  }

  async function getRootUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<RootCampaign>>> {
    const features = await GetRootUserFeatureAssets(walletAddress, RootCampaign.Based);

    if (features.success) return { success: true, value: features.value };

    return { success: false, errMessage: features.errMessage, errCode: features.errCode };
  }

  async function getLuksoFollowerCountPromise(walletAddress: string): Promise<Result<FollowUserData>> {
    const followerCount = await GetFollowerCounts(walletAddress);

    if (followerCount.success) return { success: true, value: followerCount.value };

    return { success: false, errMessage: followerCount.errMessage, errCode: followerCount.errCode };
  }

  async function getLuksoLeaderboardDataPromise(walletAddress: string): Promise<Result<LeaderboardEntry[]>> {
    const leaderboardData = await GetFullLeaderboardData(walletAddress);
    if (leaderboardData.success) return { success: true, value: leaderboardData.value };

    return { success: false, errMessage: leaderboardData.errMessage, errCode: leaderboardData.errCode };
  }

  async function getRootMintingDataPromise(): Promise<Result<MintingData>> {
    const mintingSupply = await GetRootCollectionSupply();
    const mintingPrice = await GetRootMintingPrice();
    const mintingData: MintingData = { mintSupply: undefined, mintPrice: undefined, isHolder: undefined };

    if (mintingSupply.success) {
      mintingData.mintSupply = mintingSupply.value;
    } else void LogError(Module.Citizens, "Couldn't set collection supply", mintingSupply.errCode);

    if (mintingPrice.success) {
      mintingData.mintPrice = mintingPrice.value;
    } else void LogError(Module.Citizens, "Couldn't set minting price", mintingPrice.errCode);

    mintingData.isHolder = true;

    return { success: true, value: mintingData };
  }

  async function getSolanaMintingDataPromise(walletAddress: string): Promise<Result<MintingData>> {
    const mintingSupply = await GetCollectionSupply();
    const mintingPrice = await GetMintingPrice(walletAddress);
    const mintingData: MintingData = { mintSupply: undefined, mintPrice: undefined, isHolder: undefined }

    if (mintingSupply.success) {
      mintingData.mintSupply = mintingSupply.value;
    } else void LogError(Module.Citizens, "Couldn't set collection supply", mintingSupply.errCode);

    if (mintingPrice.success) {
      mintingData.mintPrice = mintingPrice.value.price;
      mintingData.isHolder = mintingPrice.value.isHolder;
    } else void LogError(Module.Citizens, "Couldn't set minting price", mintingPrice.errCode);

    if (!mintingSupply.success && !mintingPrice.success) {
      void LogError(Module.Citizens, "Couldn't set dynamic data", mintingSupply.errCode);
      return { success: false, errMessage: "Couldn't set dynamic data", errCode: '' };
    }

    return { success: true, value: mintingData };
  }

  async function getPolygonMintingDataPromise(walletAddress: string): Promise<Result<MintingData>> {
    const mintingSupply = await GetPolygonCollectionSupply();
    const mintingData: MintingData = { mintSupply: undefined, mintPrice: undefined, isHolder: undefined }

    if (mintingSupply.success) {
      mintingData.mintSupply = mintingSupply.value;
    } else {
      void LogError(Module.Citizens, "Couldn't set collection supply", mintingSupply.errCode);
      return { success: false, errMessage: "Couldn't set collection supply", errCode: '' };
    }

    return { success: true, value: mintingData };
  }


  async function getClaimableDropsPromise(walletAddress: string): Promise<Result<Record<LuksoCampaign, ClaimableDrop[]>>> {
    const drops = await GetLuksoClaimableDrops(walletAddress);
    if (drops.success) return { success: true, value: drops.value };
    return { success: false, errMessage: drops.errMessage, errCode: drops.errCode };
  }

  const fetchAppData = async () => {
    const walletAddress = userAddress;

    if (walletAddress === null) {
      LogError(Module.Citizens, "User address is null, can't fetch app data");
      return;
    }

    if (blockchainType === Blockchain.Lukso) {
      const luksoCitizensMetadataPromise = getLuksoTokensMetadataPromise(walletAddress); // Get the citizens Lukso metadata
      const luksoUserFeaturesPromise = getLuksoUserFeaturesPromise(walletAddress); // Get the user features
      const luksoLeaderboardDataPromise = getLuksoLeaderboardDataPromise(walletAddress); // Get the leaderboard data
      const luksoClaimableDropsPromise = getClaimableDropsPromise(walletAddress); // Get the claimable drops
      const [luksoCitizensMetadata, luksoUserFeatures, luksoLeaderboardData, luksoClaimableDrops] = await Promise.all([luksoCitizensMetadataPromise, luksoUserFeaturesPromise, luksoLeaderboardDataPromise, luksoClaimableDropsPromise]);

      //Lukso Citizens Metadata dispatch
      if (luksoCitizensMetadata.success) {
        const citizen = luksoCitizensMetadata.value.find(citizen => citizen.campaign === selectedCampaign); // Find the citizen with the selected campaign

        dispatch(setCitizensMetadata(luksoCitizensMetadata.value));

        if (selectedCampaign === null) { //This case is handled when user refresh the page and is still logged in
          const userCampaigns = [...new Set(luksoCitizensMetadata.value.map(item => item.campaign))]; // Get the unique campaigns from the metadata

          if (userCampaigns.length > 0) {
            dispatch(setSelectedCampaign(userCampaigns[0]));
            dispatch(setSelectedCitizen(luksoCitizensMetadata.value[0])); // Set the selected citizen to the first one in the list

            dispatch(setMintingMode(false));
          } else {
            // REDIRECT FLOW
            dispatch(setNotificationMode(true));
          }
        } else if (!citizen) {
          // REDIRECT FLOW
          dispatch(setNotificationMode(true));
        } else {
          dispatch(setSelectedCitizen(citizen)); // Set the selected citizen to the one with the selected campaign
          
          dispatch(setMintingMode(false));
        }
      } else { // If error, log the error, citizens metadata and selected combination will be null
        LogError(Module.Citizens, luksoCitizensMetadata.errMessage, luksoCitizensMetadata.errCode);
      }

      //Lukso User Features dispatch
      if (luksoUserFeatures.success) {
        const luksoFeatures = luksoUserFeatures.value as CampaignDrops<AppCampaigns>; // Cast the lukso features to the AppCampaigns type, this depends on the wearables got for current campaign
        dispatch(setUserFeatures(luksoFeatures));
      } else {
        LogError(Module.Citizens, luksoUserFeatures.errMessage, luksoUserFeatures.errCode);
      }

      //Lukso Leaderboard Data dispatch
      if (luksoLeaderboardData.success) {
        dispatch(setLeaderboardData(luksoLeaderboardData.value));
      } else {
        LogError(Module.Citizens, luksoLeaderboardData.errMessage, luksoLeaderboardData.errCode);
      }

      if (luksoClaimableDrops.success) {
        dispatch(setClaimableDrops(luksoClaimableDrops.value as Record<Campaign, ClaimableDrop[]>));
      } else {
        LogError(Module.Citizens, luksoClaimableDrops.errMessage, luksoClaimableDrops.errCode);
      }
    } else if (blockchainType === Blockchain.Polygon) {
      const polygonCitizensMetadata = await getPolygonTokensMetadataPromise(walletAddress);
      const polygonUserFeatures = await getPolygonUserFeaturesPromise(walletAddress);

      if (polygonCitizensMetadata.success) {
        const citizen = polygonCitizensMetadata.value.find(citizen => citizen.campaign === selectedCampaign);

        dispatch(setCitizensMetadata(polygonCitizensMetadata.value));

        if (selectedCampaign === null) { //Logic when user is logged in and no campaign is selected, refreshing page case
          const userCampaigns = [...new Set(polygonCitizensMetadata.value.map(item => item.campaign))];

          if (userCampaigns.length > 0) { //If user has campaigns, set the first one as selected campaign
            dispatch(setSelectedCampaign(userCampaigns[0]));
            dispatch(setSelectedCitizen(polygonCitizensMetadata.value[0]));
            dispatch(setMintingMode(false));
          } else {//If user has no campaigns, set the polygon campaign as selected campaign and keep minting mode
            const mintingData = await getPolygonMintingDataPromise(walletAddress);

            if (mintingData.success) {
              dispatch(setMintSupply(mintingData.value.mintSupply ?? null));
            }

            dispatch(setSelectedCampaign(Campaign.Polygon)); // Set the selected campaign by default when no campaign is selected
            dispatch(setSelectedCitizen({
              baseCombination: CampaignBaseCombination.Polygon,
              combination: CampaignBaseCombination.Polygon,
              campaign: Campaign.Polygon
            } as CitizenMetadata));
          }
        } else if (!citizen) { //Logic when user is logged in and a campaign is selected, but there's no citizen in list for that campaign
          const mintingData = await getPolygonMintingDataPromise(walletAddress);
          if (mintingData.success) {
            dispatch(setMintSupply(mintingData.value.mintSupply ?? null));
          }

          dispatch(setSelectedCitizen({
            baseCombination: CampaignBaseCombination.Polygon,
            combination: CampaignBaseCombination.Polygon,
            campaign: Campaign.Polygon
          } as CitizenMetadata));
        } else {
          dispatch(setSelectedCitizen(citizen));
          dispatch(setMintingMode(false));
        }
      }
      if (polygonUserFeatures.success) {
        const polygonFeatures = polygonUserFeatures.value as CampaignDrops<AppCampaigns>;
        dispatch(setUserFeatures(polygonFeatures));
      } else {
        LogError(Module.Citizens, polygonUserFeatures.errMessage, polygonUserFeatures.errCode);
      }
    } else if (blockchainType === Blockchain.Solana) {
      const solanaCitizensMetadata = await getSolanaTokensMetadataPromise(walletAddress); // Get the citizens Solana metadata
      const solanaUserFeatures = await getSolanaUserFeaturesPromise(walletAddress); // Get the user features

      if (solanaCitizensMetadata.success) {
        const citizen = solanaCitizensMetadata.value.find(citizen => citizen.campaign === selectedCampaign); // Find the citizen with the selected campaign

        dispatch(setCitizensMetadata(solanaCitizensMetadata.value));
        if (selectedCampaign === null) { //This case is handled when user refresh the page and is still logged in

          const userCampaigns = [...new Set(solanaCitizensMetadata.value.map(item => item.campaign))]; // Get the unique campaigns from the metadata

          if (userCampaigns.length > 0) {
            dispatch(setSelectedCampaign(userCampaigns[0]));
            dispatch(setSelectedCitizen(solanaCitizensMetadata.value[0]));

            dispatch(setMintingMode(false));
          } else {
            // MINTING FLOW

            const mintingData = await getSolanaMintingDataPromise(walletAddress);
            if (mintingData.success) {
              dispatch(setMintingPrice(mintingData.value.mintPrice ?? null));
              dispatch(setMintSupply(mintingData.value.mintSupply ?? null));
              dispatch(setIsHolder(mintingData.value.isHolder ?? null));
            }

            dispatch(setSelectedCampaign(Campaign.Kumi)); // Set the selected campaign to Citizens by default when no campaign is selected
            dispatch(setSelectedCitizen({
              baseCombination: CampaignBaseCombination.Kumi,
              combination: CampaignBaseCombination.Kumi,
              campaign: Campaign.Kumi
            } as CitizenMetadata));
          }
        } else if (!citizen) {
          // MINTING FLOW

          const mintingData = await getSolanaMintingDataPromise(walletAddress);
          if (mintingData.success) {
            dispatch(setMintingPrice(mintingData.value.mintPrice ?? null));
            dispatch(setMintSupply(mintingData.value.mintSupply ?? null));
            dispatch(setIsHolder(mintingData.value.isHolder ?? null));
          }

          dispatch(setSelectedCitizen({
            baseCombination: CampaignBaseCombination.Kumi,
            combination: CampaignBaseCombination.Kumi,
            campaign: selectedCampaign
          } as CitizenMetadata));
        } else {
          dispatch(setSelectedCitizen(citizen)); // Set the selected citizen to the one with the selected campaign
          
          dispatch(setMintingMode(false));
        }
      } else { // If error, log the error, citizens metadata and selected combination will be null
        LogError(Module.Citizens, solanaCitizensMetadata.errMessage, solanaCitizensMetadata.errCode);
      }

      if (solanaUserFeatures.success) {
        const solanaFeatures = solanaUserFeatures.value as CampaignDrops<AppCampaigns>; // Cast the solana features to the AppCampaigns type, this depends on the wearables got for current campaign
        dispatch(setUserFeatures(solanaFeatures));
      } else {
        LogError(Module.Citizens, solanaUserFeatures.errMessage, solanaUserFeatures.errCode);
      }
    } else if (blockchainType === Blockchain.Root) {
      const rootCitizensMetadata = await getRootTokensMetadataPromise(walletAddress);
      const rootUserFeatures = await getRootUserFeaturesPromise(walletAddress);
      
      if (rootCitizensMetadata.success) {
        const citizen = rootCitizensMetadata.value.find(citizen => citizen.campaign === selectedCampaign);

        dispatch(setCitizensMetadata(rootCitizensMetadata.value));

        if (selectedCampaign === null) { //Logic when user is logged in and no campaign is selected, refreshing page case
          const userCampaigns = [...new Set(rootCitizensMetadata.value.map(item => item.campaign))];

          if (userCampaigns.length > 0) { //If user has campaigns, set the first one as selected campaign
            dispatch(setSelectedCampaign(userCampaigns[0]));
            dispatch(setSelectedCitizen(rootCitizensMetadata.value[0]));

            dispatch(setMintingMode(false));
          } else {//If user has no campaigns, set the based campaign as selected campaign and keep minting mode

            const mintingData = await getRootMintingDataPromise();
            if (mintingData.success) {
              dispatch(setMintingPrice(mintingData.value.mintPrice ?? null));
              dispatch(setMintSupply(mintingData.value.mintSupply ?? null));
              dispatch(setIsHolder(mintingData.value.isHolder ?? null));
            }

            dispatch(setSelectedCampaign(Campaign.Based)); // Set the selected campaign by default when no campaign is selected
            dispatch(setSelectedCitizen({
              baseCombination: CampaignBaseCombination.Based,
              combination: CampaignBaseCombination.Based,
              campaign: Campaign.Based
            } as CitizenMetadata));
          }
        } else if (!citizen) { //Logic when user is logged in and a campaign is selected, but there's no citizen in list for that campaign

          const mintingData = await getRootMintingDataPromise();
          if (mintingData.success) {
            dispatch(setMintingPrice(mintingData.value.mintPrice ?? null));
            dispatch(setMintSupply(mintingData.value.mintSupply ?? null));
          }

          dispatch(setSelectedCitizen({
            baseCombination: CampaignBaseCombination.Based,
            combination: CampaignBaseCombination.Based,
            campaign: Campaign.Based
          } as CitizenMetadata));
        } else {
          dispatch(setSelectedCitizen(citizen));

          dispatch(setMintingMode(false));
        }
      }
      if (rootUserFeatures.success) {
        const rootFeatures = rootUserFeatures.value as CampaignDrops<AppCampaigns>;
        dispatch(setUserFeatures(rootFeatures));
      } else {
        LogError(Module.Citizens, rootUserFeatures.errMessage, rootUserFeatures.errCode);
      }
    }
  };

  /* Tanto el blockchain como la campaña se seleccionan manualmente en cada boton que llama esta función */
  const HandleLogin = async (blockchain: Blockchain | undefined, campaign: Campaign | undefined) => {
    // Cambiar la red ANTES de iniciar el proceso de autenticación
    try {
      await switchToCorrectNetwork(campaign);
    } catch (error) {
      LogError(Module.Citizens, "Error switching network before login", error);
      // Continuar con el login aunque falle el cambio de red
    }

    if (blockchain === Blockchain.Root) {
      openLogin();
    } else {
      login({ walletChainType: BlockchainToWalletChainType(blockchain) });
    }
    
    // Guardar la campaña seleccionada en localStorage para persistencia
    SetSelectedCampaign(campaign ?? null);
    dispatch(setSelectedCampaign(campaign ?? null));
  }

  const switchToCorrectNetwork = async (campaign: Campaign | undefined) => {
    const provider = (window as any).ethereum;
    if (!provider) return;

    if (!campaign || !NETWORK_CONFIGS[campaign]) return;

    const { expectedChainId, config: networkConfig } = NETWORK_CONFIGS[campaign];

    try {

      const currentChainId = await provider.request({ method: 'eth_chainId' });
      const currentChainIdDecimal = parseInt(currentChainId, 16);

      if (currentChainIdDecimal !== expectedChainId) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.chainId }],
          });
        } catch (switchError: any) {
          // Solo agregar red si no existe
          if (switchError.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error(`Error switching to ${campaign} network:`, error);
      throw error;
    }
  }

  const HandleLogout = async () => {
    // Limpiar la campaña persistida cuando el usuario se desconecta
    SetSelectedCampaign(null);
    
    if (blockchainType === Blockchain.Root) {
      signOutPass({ flow: 'silent', disableConsent: true });
    } else {
      logout();
    }
  }

  //Remove Phantom from lukso login methods
  useEffect(() => {
    if (isModalOpen) {
      let tries = 0;
      const maxTries = 200; // Más intentos para cubrir más tiempo
      const interval = setInterval(() => {
        try {
          const containers = document.querySelectorAll('[class*="LoginMethodContainer"], [class*="WalletListContainer"]');
          containers.forEach(container => {
            const buttons = container.querySelectorAll('button');
            buttons.forEach(button => {
              if (button instanceof HTMLButtonElement) {
                const spans = Array.from(button.querySelectorAll('span')) as HTMLSpanElement[];
                const text = spans.map(span => span.textContent?.trim()).join(' ');
                const isPhantom = text.includes('Phantom');
                const isBackpack = text.includes('Backpack');
                const isSolana = text.includes('Solana');
                const isMetamask = text.includes('MetaMask');
                const isUniversal = text.includes('universal_profile');
            
                if ((isPhantom || isBackpack) && !isSolana) {
                  button.style.display = 'none';
                  button.setAttribute('disabled', 'true');
                  button.style.pointerEvents = 'none';
                }
                if ((isUniversal || isPhantom || isBackpack || (isMetamask && isSolana)) && (selectedCampaign === Campaign.Polygon)) {
                  button.style.display = 'none';
                  button.setAttribute('disabled', 'true');
                  button.style.pointerEvents = 'none';
                }
                
                if (isMetamask && (selectedCampaign === Campaign.Citizens || selectedCampaign === Campaign.Creators)) {
                  button.style.display = 'none';
                  button.setAttribute('disabled', 'true');
                  button.style.pointerEvents = 'none';
                }
              }
            });
          });
        } catch (error) {
          LogError(Module.Citizens, "Error in wallet button filtering", error);
          clearInterval(interval);
        }
        tries++;
        if (tries > maxTries) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isModalOpen]);

  //Privy Logic
  useEffect(() => {
    const loginLibaryflag = GetSdkConnection();
    if (ready && authenticated) {
      if (user?.wallet) {
        const connectPromise = async () => {
          const chainType = user?.wallet?.chainType as Blockchain;

          if (user?.wallet?.address === undefined) {
            LogError(Module.Citizens, "User address is undefined, can't connect to blockchain");
            return; // If the user address is undefined, log the error and return
          }

          // Cargar la campaña persistida si no hay una seleccionada actualmente
          if (selectedCampaign === null) {
            const persistedCampaign = GetSelectedCampaign();
            if (persistedCampaign) {
              dispatch(setSelectedCampaign(persistedCampaign));
              return; // Salir para que el useEffect se ejecute nuevamente con la campaña cargada
            }
          }

          if ((chainType === Blockchain.Ethereum) && isEthereumReady) { //As Lukso and solana are part of lukso, we need to check if the campaign is citizens or creators
            if (selectedCampaign === Campaign.Citizens || selectedCampaign === Campaign.Creators) {
              const provider = await ethereumWallets[0].getEthereumProvider(); // Get the lukso provider
              const browserProvider = new BrowserProvider(provider);

              setEthersProvider(browserProvider); // Cast to BrowserProvider and set the provider

              const walletNamePromise = GetUniversalProfileData(user?.wallet?.address); // Get the wallet name
              const xpDataPromise = GetUserXPData(user?.wallet?.address, chainType); // Get the user XP data
              const followerCountPromise = getLuksoFollowerCountPromise(user?.wallet?.address); // Get the follower count
              const [walletName, xpData, followerCount] = await Promise.all([walletNamePromise, xpDataPromise, followerCountPromise]);

              dispatch(connect({
                address: user?.wallet?.address,
                walletName: walletName.success ? walletName.value.name : null,
                blockchainType: Blockchain.Lukso, xpData: xpData.success ? xpData.value : null,
                followUserData: followerCount.success ? followerCount.value : null
              }));

              // Track campaign and session statistics after successful connection
              trackCampaignAndSessionAsync(selectedCampaign);

            } else if (selectedCampaign === Campaign.Polygon && isEthereumReady) { //As Polygon is part of lukso, we need to check if the campaign is polygon
              const providerPromise = ethereumWallets[0].getEthereumProvider(); // Get the lukso provider
              const xpDataPromise = GetUserXPData(user?.wallet?.address, chainType); // Get the user XP data
              const [provider, xpData] = await Promise.all([providerPromise, xpDataPromise]);
              const browserProvider = new BrowserProvider(provider);

              // Inicializar el contrato de Polygon (la red ya debería estar correcta)
              await InitializePolygonContractEssentialData(await browserProvider.getSigner());

              setEthersProvider(new BrowserProvider(provider));

              dispatch(connect({
                address: user?.wallet?.address,
                walletName: null,
                blockchainType: Blockchain.Polygon,
                xpData: xpData.success ? xpData.value : null,
                followUserData: { followerCount: -1, followingCount: -1 }
              }));

              // Track campaign and session statistics after successful connection
              trackCampaignAndSessionAsync(selectedCampaign);
            } else if (selectedCampaign === null) {
              dispatch(setSelectedCampaign(Campaign.Polygon));

            }
          } else if (chainType === Blockchain.Solana && isSolanaReady) {
            const solanaWallet = solanaWallets[0];

            const result = await InitializeUmi(solanaWallet);

            if (!result.success) {
              logout();
              return;
            }

            dispatch(connect({
              address: user?.wallet?.address,
              walletName: null,
              blockchainType: chainType,
              xpData: null,
              followUserData: { followerCount: -1, followingCount: -1 }// Set the follow user data to -1, meaning this blockchain does not support follow user data
            }));

            // Track campaign and session statistics after successful connection
            trackCampaignAndSessionAsync(selectedCampaign);
          }
          SetSdkConnection({ ...loginLibaryflag, [LoginLibrary.Privy]: true });
        }
        connectPromise();
      } // Set the user as logged in
    }
    if (ready && !authenticated && (blockchainType === Blockchain.Lukso || blockchainType === Blockchain.Solana || blockchainType === Blockchain.Polygon || loginLibaryflag[LoginLibrary.Privy])) { //We don't need the blockchain type as use effect dependency because to be connected, blockchain type must be defined
      dispatch(disconnect());
      SetSdkConnection({ ...loginLibaryflag, [LoginLibrary.Privy]: false });
      SetSelectedCampaign(null); // Limpiar la campaña persistida al desconectarse
    }
  }, [ready, authenticated, isEthereumReady, isSolanaReady, selectedCampaign]);

  // Root Logic
  useEffect(() => {
    const connectPromise = async () => {
      const loginLibaryflag = GetSdkConnection();

      if (!isFetchingSession && userSession && signer) {
        // Cargar la campaña persistida si no hay una seleccionada actualmente para Root
        if (selectedCampaign === null) {
          const persistedCampaign = GetSelectedCampaign();
          if (persistedCampaign) {
            dispatch(setSelectedCampaign(persistedCampaign));
            return; // Salir para que el useEffect se ejecute nuevamente con la campaña cargada
          }
        }

        const futurePassAddress = userSession.futurepass;

        await InitializeContractEssentialData(signer,undefined, userSession);

        dispatch(connect({ address: futurePassAddress, walletName: null, blockchainType: Blockchain.Root, xpData: null, followUserData: { followerCount: -1, followingCount: -1 } }));
        SetSdkConnection({ ...loginLibaryflag, [LoginLibrary.Pass]: true });

        // Track campaign and session statistics after successful connection
        trackCampaignAndSessionAsync(selectedCampaign);
      }
      if (!isFetchingSession && !userSession && (blockchainType === Blockchain.Root || !blockchainType) && loginLibaryflag[LoginLibrary.Pass]) { //We don't need the blockchain type as use effect dependency because to be connected, blockchain type must be defined
        dispatch(disconnect());
        SetSdkConnection({ ...loginLibaryflag, [LoginLibrary.Pass]: false });
        SetSelectedCampaign(null); // Limpiar la campaña persistida al desconectarse
      }
    }
    connectPromise();
  }, [isFetchingSession, userSession, signer]);

  useEffect(() => {
    const loginLibraryFlag = GetSdkConnection();

    if (loginLibraryFlag === null) {
      dispatch(disconnect());
      SetSdkConnection({ [LoginLibrary.Privy]: false, [LoginLibrary.Pass]: false });
      SetSelectedCampaign(null); // Limpiar la campaña persistida al desconectarse
      return;
    }

    const loginLibraryFilter = Object.values(loginLibraryFlag).filter(flag => flag === true || flag === null);

    if (loginLibraryFilter.length === 0) {
      dispatch(disconnect());
      SetSelectedCampaign(null); // Limpiar la campaña persistida al desconectarse
    }
  }, [isFetchingSession]);

  useEffect(() => {
    if (isConnected === true) {
      if (citizensMetadata === null) {
        if (userAddress === null) {
          LogError(Module.Citizens, "User address is null, can't fetch citizens metadata");
          return;
        }
        fetchAppData();
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