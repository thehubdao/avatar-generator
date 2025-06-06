import { useLogin, useLogout, usePrivy, useSolanaWallets, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Blockchain, LoginLibrary } from '../enums/blockchain/common.enum';
import { resetCitizensMetadata, setCampaignParameters, setCitizensMetadata, setLeaderboardData, setMintingMode, setMintingPrice, setMintSupply, setSelectedCampaign, setSelectedCitizen, setUserFeatures } from '../store/citizensMetadataSlice';
import { GetCampaignsTokensMetadata, GetFullLeaderboardData, GetLuksoUserFeatures } from '../utils/web3/lukso/contract.util';
import { GetCampaignCitizensMetadata, GetCollectionSupply, GetMintingPrice, GetSolanaUserFeatureAssets, InitializeUmi } from '../utils/web3/solana/contract.util';
import { CitizenMetadata, FollowUserData, MintingData } from '../interfaces/citizens.interface';
import { LogError, RemoveUndefinedProperties } from '../utils/common.util';
import { CampaignParameterName, Module } from '../enums/common.enum';
import { useDispatch } from 'react-redux';
import { Result } from '../types/common.type';
import { GetFollowerCounts, GetUniversalProfileData } from '../utils/web3/citizens.util';
import { BlockchainToWalletChainType } from '../utils/web3/web3.util';
import { Campaign, LuksoCampaign, SolanaCampaign, CampaignBaseCombination, RootCampaign } from '../enums/citizens/common.enum';
import { connect, disconnect, setIsHolder } from '../store/citizensAuthSlice';
import { useAppSelector } from '../store/hooks';
import { GetParameter } from '../utils/firebase.util';
import { CampaignParameters } from '../interfaces/common.interface';
import { CampaignDrops, AppCampaigns } from '../types/citizens.type';
import { BrowserProvider } from 'ethers';
import { useAuthUi } from '@futureverse/auth-ui';
import { useAuth, useFutureverseSigner } from '@futureverse/auth-react';
import { GetUserXPData } from '../utils/api.util';
import { LeaderboardEntry } from '../types/leaderboard.type';
import { GetRootAssetsMetadata, GetRootCollectionSupply, GetRootMintingPrice, GetRootUserFeatureAssets } from '../utils/web3/root/contract.util';
import { InitializeContractEssentialData } from '../constants/root/contract.constant';

export function useBlockchainWallet() {
  const dispatch = useDispatch();
  const isConnected = useAppSelector(state => state.citizensAuth.connected);
  const userAddress = useAppSelector(state => state.citizensAuth.address);
  const blockchainType = useAppSelector(state => state.citizensAuth.blockchainType);

  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const citizensMetadata = useAppSelector(state => state.citizensMetadata.citizensMetadata);

  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | null>(null);
  const [loginLibraryFlags, setLoginLibraryFlags] = useState<{ [key in LoginLibrary]: boolean | null }>({
    [LoginLibrary.Privy]: null,
    [LoginLibrary.Pass]: null
  });

  /* Fetching relatedhooks */
  const { ready, user, authenticated, isModalOpen } = usePrivy(); //Privy Auth
  const { userSession, isFetchingSession, signOutPass } = useAuth(); //Pass Auth

  /* Login and Logout related hooks */

  const { login } = useLogin(); //Privy Login
  const { logout } = useLogout(); //Privy Logout

  const { openLogin } = useAuthUi(); //Futureverse Login

  /* Signer related hooks */

  const { wallets: ethereumWallets, ready: isEthereumReady } = useWallets(); //Privy Ethereum Wallets
  const { wallets: solanaWallets, ready: isSolanaReady } = useSolanaWallets(); //Privy Solana Wallets

  const signer = useFutureverseSigner(); //Futureverse Signer


  const getCampaignParams = async (campaign: Campaign) => {
    const campaignParams = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
    if (campaignParams.success) {
      dispatch(setCampaignParameters(RemoveUndefinedProperties(campaignParams.value)));
    } else void LogError(Module.Citizens, 'Error on getting campaign parameters');
  }

  async function getSolanaTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const asset = await GetCampaignCitizensMetadata(walletAddress);

    if (asset.success) return { success: true, value: asset.value };

    return { success: false, errMessage: asset.errMessage, errCode: asset.errCode };
  }

  async function getEthereumTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const tokensMetadata = await GetCampaignsTokensMetadata(walletAddress);

    if (tokensMetadata.success) return { success: true, value: tokensMetadata.value };

    return { success: false, errMessage: tokensMetadata.errMessage, errCode: tokensMetadata.errCode };
  }

  async function getRootTokensMetadataPromise(walletAddress: string): Promise<Result<CitizenMetadata[]>> {
    const asset = await GetRootAssetsMetadata(walletAddress);
    if (asset.success) return { success: true, value: asset.value };

    return { success: false, errMessage: asset.errMessage, errCode: asset.errCode };
  }

  async function getEthereumUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<LuksoCampaign>>> {
    const features = await GetLuksoUserFeatures(walletAddress);

    if (features.success) return { success: true, value: features.value };

    return { success: false, errMessage: features.errMessage, errCode: features.errCode };
  }

  async function getSolanaUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<SolanaCampaign>>> {
    const features = await GetSolanaUserFeatureAssets(walletAddress, SolanaCampaign.Kumi);

    if (features.success) return { success: true, value: features.value };

    return { success: false, errMessage: features.errMessage, errCode: features.errCode };
  }

  async function getRootUserFeaturesPromise(walletAddress: string): Promise<Result<CampaignDrops<RootCampaign>>> {
    const features = await GetRootUserFeatureAssets(walletAddress, RootCampaign.Based);

    if (features.success) return { success: true, value: features.value };

    return { success: false, errMessage: features.errMessage, errCode: features.errCode };
  }

  async function getEthereumFollowerCountPromise(walletAddress: string): Promise<Result<FollowUserData>> {
    const followerCount = await GetFollowerCounts(walletAddress);

    if (followerCount.success) return { success: true, value: followerCount.value };

    return { success: false, errMessage: followerCount.errMessage, errCode: followerCount.errCode };
  }

  async function getEthereumLeaderboardDataPromise(walletAddress: string): Promise<Result<LeaderboardEntry[]>> {
    const leaderboardData = await GetFullLeaderboardData(walletAddress);

    if (leaderboardData.success) return { success: true, value: leaderboardData.value };

    return { success: false, errMessage: leaderboardData.errMessage, errCode: leaderboardData.errCode };
  }

  async function getRootMintingDataPromise(): Promise<Result<MintingData>> {
    const mintingSupply = await GetRootCollectionSupply();
    const mintingPrice = await GetRootMintingPrice();
    const mintingData: MintingData = { mintSupply: undefined, mintPrice: undefined, isHolder: undefined }

    if (mintingSupply.success) {
      mintingData.mintSupply = mintingSupply.value;
    } else void LogError(Module.Citizens, "Couldn't set collection supply", mintingSupply.errCode);

    if(mintingPrice.success){
      mintingData.mintPrice = mintingPrice.value;
    } else void LogError(Module.Citizens, "Couldn't set minting price", mintingPrice.errCode);

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


  const fetchAppData = async () => {
    const walletAddress = userAddress;

    if (walletAddress === null) {
      LogError(Module.Citizens, "User address is null, can't fetch app data");
      return;
    }

    if (blockchainType === Blockchain.Ethereum) {
      const ethereumCitizensMetadata = await getEthereumTokensMetadataPromise(walletAddress); // Get the citizens Ethereum metadata
      const ethereumUserFeatures = await getEthereumUserFeaturesPromise(walletAddress); // Get the user features
      const ethereumLeaderboardData = await getEthereumLeaderboardDataPromise(walletAddress); // Get the leaderboard data

      //Ethereum Citizens Metadata dispatch
      if (ethereumCitizensMetadata.success) {
        const citizen = ethereumCitizensMetadata.value.find(citizen => citizen.campaign === selectedCampaign); // Find the citizen with the selected campaign

        dispatch(setCitizensMetadata(ethereumCitizensMetadata.value));

        if (selectedCampaign === null) { //This case is handled when user refresh the page and is still logged in
          const userCampaigns = [...new Set(ethereumCitizensMetadata.value.map(item => item.campaign))]; // Get the unique campaigns from the metadata

          if (userCampaigns.length > 0) {
            dispatch(setSelectedCampaign(userCampaigns[0]));
            dispatch(setSelectedCitizen(ethereumCitizensMetadata.value[0])); // Set the selected citizen to the first one in the list
            dispatch(setMintingMode(false));
          } else {
            // MINTING FLOW
            dispatch(setSelectedCampaign(Campaign.Creators)); // Set the selected campaign to Citizens by default when no campaign is selected
            dispatch(setSelectedCitizen({
              baseCombination: CampaignBaseCombination.Creators,
              combination: CampaignBaseCombination.Creators,
              campaign: Campaign.Creators
            } as CitizenMetadata));
          }
        } else if (!citizen) {
          // MINTING FLOW
          dispatch(setSelectedCitizen({
            baseCombination: CampaignBaseCombination.Creators,
            combination: CampaignBaseCombination.Creators,
            campaign: selectedCampaign
          } as CitizenMetadata));
        } else {
          dispatch(setSelectedCitizen(citizen)); // Set the selected citizen to the one with the selected campaign
          dispatch(setMintingMode(false));
        }
      } else { // If error, log the error, citizens metadata and selected combination will be null
        LogError(Module.Citizens, ethereumCitizensMetadata.errMessage, ethereumCitizensMetadata.errCode);
      }

      //Ethereum User Features dispatch
      if (ethereumUserFeatures.success) {
        const ethereumFeatures = ethereumUserFeatures.value as CampaignDrops<AppCampaigns>; // Cast the ethereum features to the AppCampaigns type, this depends on the wearables got for current campaign
        dispatch(setUserFeatures(ethereumFeatures));
      } else {
        LogError(Module.Citizens, ethereumUserFeatures.errMessage, ethereumUserFeatures.errCode);
      }

      //Ethereum Leaderboard Data dispatch
      if (ethereumLeaderboardData.success) {
        dispatch(setLeaderboardData(ethereumLeaderboardData.value));
      } else {
        LogError(Module.Citizens, ethereumLeaderboardData.errMessage, ethereumLeaderboardData.errCode);
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

//Remove Phantom from ethereum login methods
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
                const isUniversal = text.includes('universal_profile');
                const isSolana = text.includes('Solana');
                if ((isPhantom || isBackpack) && !isSolana) {
                  button.style.display = 'none';
                  button.setAttribute('disabled', 'true');
                  button.style.pointerEvents = 'none';
                }
                if (isUniversal && isSolana) {
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
    if (ready && authenticated) {
      if (user?.wallet) {
        const connectPromise = async () => {
          const chainType = user?.wallet?.chainType as Blockchain;

          if (user?.wallet?.address === undefined) {
            LogError(Module.Citizens, "User address is undefined, can't connect to blockchain");
            return; // If the user address is undefined, log the error and return
          }

          if (chainType === Blockchain.Ethereum && isEthereumReady) {
            const provider = await ethereumWallets[0].getEthereumProvider(); // Get the ethereum provider
            const walletName = await GetUniversalProfileData(user?.wallet?.address); // Get the wallet name
            const xpData = await GetUserXPData(user?.wallet?.address, chainType); // Get the user XP data
            const followerCount = await getEthereumFollowerCountPromise(user?.wallet?.address); // Get the follower count

            setEthersProvider(new BrowserProvider(provider)); // Cast to BrowserProvider and set the provider

            dispatch(connect({
              address: user?.wallet?.address,
              walletName: walletName.success ? walletName.value.name : null,
              blockchainType: chainType, xpData: xpData.success ? xpData.value : null,
              followUserData: followerCount.success ? followerCount.value : null
            }));

            setLoginLibraryFlags(prev => ({ ...prev, [LoginLibrary.Privy]: true }));

          } else if (chainType === Blockchain.Solana && isSolanaReady) {
            const solanaWallet = solanaWallets[0];

            await InitializeUmi(solanaWallet);

            dispatch(connect({
              address: user?.wallet?.address,
              walletName: null,
              blockchainType: chainType,
              xpData: null,
              followUserData: { followerCount: -1, followingCount: -1 }// Set the follow user data to -1, meaning this blockchain does not support follow user data
            }));
            setLoginLibraryFlags(prev => ({ ...prev, [LoginLibrary.Privy]: true }));
          }
        }
        connectPromise();
      } // Set the user as logged in
    }
    if (ready && !authenticated) { //We don't need the blockchain type as use effect dependency because to be connected, blockchain type must be defined
      if (blockchainType === Blockchain.Ethereum || blockchainType === Blockchain.Solana) dispatch(disconnect());
      else setLoginLibraryFlags(prev => ({ ...prev, [LoginLibrary.Privy]: false }));
    }
  }, [ready, authenticated, isEthereumReady, isSolanaReady]);

  // Root Logic
  useEffect(() => {
    const connectPromise = async () => {
      if (!isFetchingSession && userSession && signer) {
        const eoa = userSession.linked[0].eoa;

        await InitializeContractEssentialData(signer);

        dispatch(connect({ address: eoa, walletName: null, blockchainType: Blockchain.Root, xpData: null, followUserData: { followerCount: -1, followingCount: -1 } }));
        setLoginLibraryFlags(prev => ({ ...prev, [LoginLibrary.Pass]: true }));
      }
      if (!isFetchingSession && !userSession) { //We don't need the blockchain type as use effect dependency because to be connected, blockchain type must be defined
        if (blockchainType === Blockchain.Root) dispatch(disconnect());
        else setLoginLibraryFlags(prev => ({ ...prev, [LoginLibrary.Pass]: false }));
      }
    }
    connectPromise();
  }, [isFetchingSession, userSession]);

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


  useEffect(() => {
    const loginLibraryFilter = Object.values(loginLibraryFlags).filter(flag => flag === true || flag === null);
    if (loginLibraryFilter.length === 0)
      dispatch(disconnect());

  }, [loginLibraryFlags])


  return {
    HandleLogin,
    HandleLogout,
    ethersProvider
  };
} 