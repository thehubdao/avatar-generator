'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { BasicData, CampaignParameters, ExportInterface, LookAtVectors } from "../../interfaces/common.interface";
import { Campaign, CampaignDrops, TokenId, TokenMetadata } from "../../types/metadata.type";
import LoginUI from "../../ui/citizens/sections/login.ui";
import ConnectButton from "../../ui/citizens/common/connectButton.ui";
import CitizensUI from "../../ui/citizens/citizens.ui";
import { burnDrop, checkClaimStatus, getCampaignsTokenIds, getUserFeatures, setTokenMetadata } from "../../utils/web3/contract.util";
import { CitizensCollection, DataBaseDrop } from "../../interfaces/citizens.interface";
import Button from "../../ui/citizens/common/button.ui";
import ArrowLinkSVG from "../../ui/citizens/common/SVG/arrowLinkSVG.ui";
import { CitizensSections } from "../../enums/citizens/common.enum";
import { getTokenMetadata } from "../../utils/web3/contract.util"; // Add this import
import { BodyPart, CollectionType } from "../../types/avatar.type";
import AvatarEditor, {
  ChangeFeature,
  ChangeSkinColor,
  ChangeStartAnimation,
  GetAvatarGLB,
  SetEnvironment,
  SetFeaturesData,
} from '../avatar/editor.component'
import { GetAccessoryListByCampaign, GetEnvMapListByCampaign, GetAvatarSingleByCampaignCombinationString, GetAvatarSingleByCampaignCombination, GetAssetsListByCampaign, GetAnimationByCampaignAndName, FetchBlob, FetchClaimableDrops, ApproveClaimForUser } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { FilterList, LogError, MixArrays } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { fileCampaignNameLabel } from "../../constants/lukso/labels.constant";
import { SaveFile } from "../../utils/exporter.util";
import { StorageLocation } from "../../enums/firebase.enum";
import { useCallback, useEffect, useState } from "react";
import HudUI from "../../ui/avatar/hud.ui";
import { AGChangeCamPosition, AGChangeLookAtPosition } from "../avatar/viewer.component";
import { uploadMetadata } from "../../utils/metadata.util";
import { LeaderboardEntry } from '../../types/leaderboard.type';
import { FollowUser, GetFollowStatuses, GetUniversalProfileData, UnfollowUser } from "../../utils/web3/lukso.util";
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useSnackbar } from '../../ui/citizens/snackbar/snackbar.provider';
import { claimDrop } from '../../utils/web3/contract.util';
import LogoTheHub from '../../ui/citizens/common/SVG/logoTheHubSVG.ui';
import Image from 'next/image';
import SocialButtons from '../../ui/citizens/common/socialButtons.ui';

const COLLECTIONS: CitizensCollection[] = [
  {
    name: 'Lukso Citizens',
    image: '/resources/images/campaings/citizens_collection_image.png',
    campaign: 'vrm_female'
  },
  {
    name: 'Lukso Creators',
    image: '/resources/images/campaings/creators_collection_image.png',
    campaign: 'vrm_male'
  },
]

const isValidIPFSHash = (hash: string): boolean => {
  return hash.startsWith('baf') || hash.startsWith('Qm');
};

interface CitizensComponentProps {
  campaignParams?: CampaignParameters;
  setCampaign: (campaign?: Campaign) => void;
  isLoggedIn?: boolean;
  closeConnection: () => void;
}

const exportData: ExportInterface = { attributes: [] }
let envMapList: EnvMapInterface[] | undefined
let singleInitData: SingleInterface | undefined
let accessoryList: FeatureInterface[] | undefined
let optionList: FeatureInterface[] | undefined
let featureList: FeatureInterface[] | undefined


export default function CitizensComponent({ campaignParams, setCampaign, isLoggedIn, closeConnection }: CitizensComponentProps) {
  const { showSnackbar } = useSnackbar();
  const { user, ready: isReady, logout } = usePrivy()
  const { wallets } = useWallets();
  const [isSigned, setIsSigned] = useState(isLoggedIn)
  const [collectionList] = useState<CitizensCollection[] | null | undefined>(COLLECTIONS); // collections to show before login, it controls the view flow: undefined: loading state, null: error getting data, CitizensCollection[]: show collections
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingCombination, setIsSavingCombination] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<CitizensSections>(CitizensSections.View);
  const [isBurguerOpen, setIsBurguerOpen] = useState<boolean>(false);

  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined)

  const [loadedTokens, setLoadedTokens] = useState<TokenMetadata[]>();

  const [currentCollection, setCurrentCollection] = useState<CollectionType>({
    campaign: campaignParams?.campaign as Campaign,
    combination: '',
    baseCombination: '',
    tokenMetadata: {} as TokenMetadata
  })

  // Edit state
  const [isEditModeSelected, setIsEditModeSelected] = useState<boolean>(false);
  const [optionListShow, setOptionListShow] = useState<FeatureInterface[]>();
  const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(
    exportData.attributes
  );
  const [skinColor, setSkinColor] = useState<string>(
    campaignParams?.config.skin?.defColor ?? 'FFFFFF'
  );
  const [selectedLoginCampaign, setSelectedLoginCampaign] = useState<Campaign>();
  const [selectedCategory, setSelectedCategory] = useState<string>('head');
  const [tokenIdList, setTokenIdList] = useState<TokenId[]>();
  const [userWearables, setUserWearables] = useState<CampaignDrops | undefined>(undefined);

  const [claimableDrops, setClaimableDrops] = useState<DataBaseDrop[]>([])

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | undefined>([]);

  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();


  const updateCollection = useCallback((newCampaign: Campaign, newCombination: string, tokenMetadata: TokenMetadata) => {
    const newCollection: CollectionType = {
      campaign: newCampaign, combination: newCombination,
      tokenMetadata,
      baseCombination: tokenMetadata.baseCombination
    };

    setCurrentCollection(newCollection);
    setCampaign(newCollection.campaign); // This updates the parent state

  }, [setCampaign]);

  useEffect(() => {
    if (!user?.wallet?.address) return

    setWalletAddress(user.wallet.address.toLowerCase())
  }, [user?.wallet?.address])

  useEffect(() => {
    if (!walletAddress) return
    const getTokensMetadataPromise = async () => {
      const tokenIds = await getCampaignsTokenIds(walletAddress)
      if (tokenIds.length <= 0) {
        setCurrentSection(CitizensSections.Collection);
        setIsLoading(false);
        setLoadedTokens([])
      } else {
        setTokenIdList(tokenIds)
      }
    }
    void getTokensMetadataPromise()
  }, [walletAddress])

  useEffect(() => {
    if (!tokenIdList) return

    const loadTokenMetadata = async () => {
      let isFirstToken = false;
      try {
        if (tokenIdList.length === 0) return setLoadedTokens([])
        tokenIdList.forEach(async (tokenIdMetadata) => {
          try {
            if (!isValidIPFSHash(tokenIdMetadata.metadataUri)) {
              throw new Error('Invalid IPFS hash format');
            }
            const tokenMetadata = await getTokenMetadata(tokenIdMetadata);

            if (!isFirstToken && tokenIdMetadata.campaign === selectedLoginCampaign) {
              updateCollection(tokenMetadata.campaign as Campaign, tokenMetadata.combination, tokenMetadata)
              isFirstToken = true;
            }

            setLoadedTokens(prevTokens => {
              if (!prevTokens) return [tokenMetadata];
              return [...prevTokens, tokenMetadata];
            });
          } catch (error) {
            LogError(Module.Citizens, `Error loading metadata for token ${tokenIdMetadata.tokenId}:`, error);
          }
        })



      } catch (error) {
        LogError(Module.Citizens, 'Error loading token metadata:', error);
      }

    };

    loadTokenMetadata();
  }, [tokenIdList]);

  const handleUserFeatures = async () => {
    if (!walletAddress) return
    const features = await getUserFeatures(walletAddress)

    setUserWearables(features)
  }

  useEffect(() => {
    handleUserFeatures()
  }, [walletAddress])


  useEffect(() => {
    void getFeatureList()
  }, [userWearables])

  useEffect(() => {
    async function fetchDrops() {
      if (!signer) return
      const drops = await FetchClaimableDrops();
      console.log('DROPS', drops)
      Promise.all(drops.map(async (drop) => {
        drop.owned = await checkClaimStatus(drop, signer, user?.wallet?.address || '');
      }))
      setClaimableDrops(drops);
    }
    fetchDrops();
  }, [signer]);

  const handleClaim = async (drop: DataBaseDrop) => {
    if (!user?.wallet || !signer) return false;

    try {
      const isApproved = await ApproveClaimForUser(user.wallet.address, drop.id)
      if (!isApproved) {
        LogError(Module.Citizens, 'Error claiming drop: is not approved');
        return false;
      }

      const isOwned = await claimDrop(drop, signer, user.wallet.address);

      setClaimableDrops(prevDrops =>
        prevDrops.map(d =>
          d.id === drop.id
            ? { ...d, owned: isOwned }
            : d
        )
      );

      await handleUserFeatures();
      return true;
    } catch (error) {
      LogError(Module.Citizens, 'Error claiming drop:', error);
      return false;
    }
  }


  async function getEnvironmentMapList() {
    if (!campaignParams?.campaign) return
    const result = await GetEnvMapListByCampaign(campaignParams?.campaign)
    envMapList = result.success ? result.value : undefined
  }

  async function getSingleInfo() {
    if (
      campaignParams?.config.defAvatarCombination == undefined ||
      !campaignParams?.campaign
    )
      return

    const result = await GetAvatarSingleByCampaignCombination(
      campaignParams?.campaign,
      campaignParams.config.defAvatarCombination
    )
    singleInitData = result.success ? result.value : undefined
  }

  async function getAccessoryList() {
    const result = await GetAccessoryListByCampaign(
      campaignParams?.campaign
    )
    accessoryList = result.success ? result.value : undefined
  }

  async function getFeatureList() {
    if (!userWearables) return
    const result = await GetAssetsListByCampaign(campaignParams?.campaign)
    featureList = result.success ? result.value : undefined
    optionList = []
    optionList = MixArrays(optionList, featureList)
    optionList = MixArrays(optionList, accessoryList)

    const combinationIndexes = currentCollection.baseCombination?.split('-')
    let filteredOptionList: FeatureInterface[] = []
    //This algorithm can be done in a better way, change it in the future.
    // Get features from combination and make them visible on avatar edit mode.
    combinationIndexes?.forEach((featureIndex: string, index) => {
      const filteredArray = optionList?.filter((val) => {
        const categoryIndex = campaignParams?.features?.find(
          (category) => {
            return category.displayName === val.type
          }
        )?.index

        if (!categoryIndex) return

        return (
          categoryIndex - 1 === index &&
          val.index.toString() === featureIndex
        )
      })

      if (!filteredArray) return

      filteredOptionList = filteredOptionList.concat(filteredArray)
    })

    const campaignuserWearables =
      userWearables[campaignParams?.campaign as keyof typeof userWearables]
    if (campaignuserWearables) {
      const formatteduserWearables = campaignuserWearables
        .map((val) => {
          return optionList?.find(
            (option) =>
              option.type === val.type &&
              val.index === option.index
          ) as FeatureInterface
        })
        .filter((val) => {
          const categoryIndex = campaignParams?.features?.find(
            (category) => {
              return category.displayName === val.type
            }
          )?.index

          if (!categoryIndex || !combinationIndexes) return true

          return !combinationIndexes[categoryIndex - 1]?.includes(
            val.index.toString()
          )
        })
      const wearablesWithBalance = formatteduserWearables.map(wearable => {
        wearable.balance = userWearables[campaignParams?.campaign as keyof typeof userWearables].find(w => w.type === wearable.type && w.index === wearable.index)?.balance
        return wearable
      })
      filteredOptionList = filteredOptionList.concat(wearablesWithBalance)
    }

    optionList = filteredOptionList
    const filteredList = FilterList(optionList, 'type', selectedCategory)

    return setOptionListShow(filteredList)
  }

  function addReplaceAttribute(addId: string, addValue: string) {
    if (exportData && exportData.attributes.some((x) => x.id === addId)) {
      const oldAttribute = exportData.attributes.find(
        (x) => x.id === addId
      )
      if (oldAttribute) oldAttribute.val = addValue

      setSelectedOpc([...exportData.attributes])
      return
    }

    exportData?.attributes.push({ id: addId, val: addValue })
    setSelectedOpc([...exportData.attributes])
  }

  async function getSingleData(campaign: string, combination: string) {
    const numResult = await GetAvatarSingleByCampaignCombinationString(
      campaign,
      combination
    )
    singleInitData = numResult.success ? numResult.value : undefined;
    await getAccessoryList();
    await getFeatureList();

    singleInitData?.features.forEach((feature) => {
      addReplaceAttribute(feature.val.type, feature.val.name);
    });
  }

  async function loadSingleData() {
    if (!singleInitData) {
      LogError(Module.Lukso, 'Missing single data!');
      return;
    }

    for (const { val } of singleInitData.features) {
      const { id, path, type, name } = val;
      const { tokenMetadata } = currentCollection;
      const bodyIndex = val.type.toLowerCase() as keyof typeof tokenMetadata.body;
      tokenMetadata.body[bodyIndex] = val as BodyPart;

      await ChangeFeature(
        id,
        path,
        name,
        type,
        campaignParams?.config.skin?.defColor ?? 'ffffff'
      );
    }
  }

  async function onAvatarBuilderReady(
    currentCombination: string,
    campaign?: string
  ) {
    if (!campaign) return
    setIsLoading(true);

    await Promise.all([
      getEnvironmentMapList(),
      getSingleInfo(),
      getSingleData(campaign, currentCombination),
    ])

    await SetFeaturesData(campaignParams?.features ?? [])

    const bgMap = envMapList?.find(
      (em) => em.name === 'gray-01'
    )
    const lightMap = envMapList?.find(
      (em) => em.name === campaignParams?.config.envMap?.defLightMap
    )
    await SetEnvironment(
      bgMap?.path,
      lightMap?.path,
      campaignParams?.config.envMap?.skyboxConfig
    )

    // Set features from single
    await loadSingleData()

    // Set skin tone
    await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'ffffff')

    // Set animation
    const result = await GetAnimationByCampaignAndName(
      campaignParams?.campaign,
      campaignParams?.config.defAnimation
    )

    if (result.success) {
      await ChangeStartAnimation(result.value.at(0)?.path)
    }

    setIsLoading(false)
  }

  async function exportModel() {
    exportData.attributesBase64 = window.btoa(
      JSON.stringify(exportData.attributes)
    )
    const vrmStorageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${campaignParams?.campaign}%2F${StorageLocation.AvatarVrms}%2F${currentCollection.combination}.vrm?alt=media&token=ad2e1e79-6c26-4284-92c3-2e42f5166b42`
    const [
      picturePromise,
      modelGLBPromise,
      modelVRMPromise,
    ] = await Promise.all([
      FetchBlob(currentCollection.tokenMetadata.imageUrl),
      GetAvatarGLB(),
      FetchBlob(vrmStorageUrl),
    ])
    console.log('EXPORTING VRM, GLB and image...')
    const modelVRM = modelVRMPromise
    const modelGLB = modelGLBPromise.success
      ? modelGLBPromise.value
      : undefined
    const filesName =
      fileCampaignNameLabel[campaignParams?.campaign as Campaign] +
      currentCollection.tokenMetadata.tokenId
    if (modelVRM && modelGLBPromise.success) {
      await SaveFile(modelVRM, `${filesName}.vrm`)
      await SaveFile(modelGLB, `${filesName}.glb`)
      await SaveFile(picturePromise, `${filesName}.png`)
    }
  }

  async function onOptionChange(
    id: string,
    path: string,
    name: string,
    _selectedCategory: string = selectedCategory
  ) {
    const currentFeatures = singleInitData?.features
    const changedFeature = optionList?.find(
      (feature) => feature.type === _selectedCategory && feature.id === id
    )
    const currentFeaturesTypeIndex = currentFeatures?.findIndex(
      (feature) => feature.val.type === _selectedCategory
    )

    if (
      currentFeaturesTypeIndex != undefined &&
      changedFeature &&
      singleInitData
    ) {
      singleInitData.features[
        currentFeaturesTypeIndex
      ].val = changedFeature
    }

    await ChangeFeature(
      id,
      path,
      name,
      _selectedCategory,
      campaignParams?.config.skin?.defColor ?? skinColor,
      campaignParams?.config.skin?.materialName,
      campaignParams?.config.changeMaterial
    )

    addReplaceAttribute(_selectedCategory, name)
  }

  function onCategoryTypeChange(value: string) {
    setSelectedCategory(value)
    setOptionListShow(FilterList(optionList, 'type', value))
    updateFeatureCamPosition(value, {
      ...campaignParams?.config.featuresCamPos,
      ...campaignParams?.config.accCamPos,
    })
  }

  function updateFeatureCamPosition(
    index: string,
    posLocation?: Record<string, LookAtVectors>
  ) {
    const confRef = posLocation ? posLocation[index] : undefined
    if (confRef == undefined) return

    AGChangeCamPosition(confRef.pos)
    AGChangeLookAtPosition(confRef.lookAt)
  }

  async function onClickChangeSkinColor(newSkinColor = skinColor) {
    await ChangeSkinColor(
      newSkinColor,
      campaignParams?.config.skin?.materialName
    )
    setSkinColor(newSkinColor)
  }

  const onSavingCombinationSnackbar = () => {
    setIsSavingCombination(true);
    showSnackbar(
      <p>The changes are being saved onchain, it might take up to 30 seconds for them to be effective. Do not leave the app.</p>
    );
  };

  const onSavedCombinationSnackbar = () => {
    setIsSavingCombination(false);
    showSnackbar(
      <p>The change was successfully saved.</p>
    );
  };

  const onFailedCombinationSnackbar = () => {
    setIsSavingCombination(false);
    showSnackbar(
      <p>Saving failed, try again later.</p>
    );
  };

  async function saveCombination() {
    if (!walletAddress) return

    const newCombination = singleInitData?.features
      .map((feature) => feature.val.index)
      .join('-') as string
    const currentCampaign = campaignParams?.campaign as Campaign
    const currentFeatures = singleInitData?.features
    const newMetadata = currentCollection.tokenMetadata
    newMetadata.combination = newCombination
    newMetadata.attributes = []

    const _tokenIdList = [...tokenIdList as TokenId[]];

    const tokenIdIndex = _tokenIdList.findIndex(
      ({ tokenId }) => tokenId === currentCollection.tokenMetadata.tokenId
    )

    const originalMetadataUri = _tokenIdList[tokenIdIndex].metadataUri

    try {
      onSavingCombinationSnackbar();
      const burnDropArray: BodyPart[] = []
      //NOTE: female campaign has it's types different from the DB
      const femaleCampaignBodyTypes = {
        head: 'hair',
        face: 'accesories',
        legs: 'legs',
        chest: 'chest',
        shoes: 'feet',
        accesories: 'face',
        feet: 'shoes',
        hair: 'head'
      }

      currentFeatures?.forEach((feature) => {
        newMetadata.attributes?.push({
          key:
            currentCampaign == 'vrm_female'
              ? femaleCampaignBodyTypes[
              feature.val.type.toLowerCase() as keyof typeof femaleCampaignBodyTypes
              ]
              : feature.val.type.toLowerCase(),
          value: feature.val.name,
          type: 'string',
        })
        let bodyFeature

        if (currentCampaign == 'vrm_female') bodyFeature = newMetadata.body[femaleCampaignBodyTypes[feature.val.type.toLowerCase() as keyof typeof femaleCampaignBodyTypes] as keyof typeof newMetadata.body]
        else bodyFeature = newMetadata.body[feature.val.type.toLowerCase() as keyof typeof newMetadata.body]

        if (bodyFeature && bodyFeature.name != feature.val.name) {
          newMetadata.body[
            feature.val.type.toLowerCase() as keyof typeof newMetadata.body
          ] = feature.val as BodyPart

          burnDropArray.push(feature.val as BodyPart)
        }
      })

      const metadataObject = await uploadMetadata(
        newMetadata,
        undefined,
        newCombination,
        currentCampaign
      )
      console.log(metadataObject.uri)
      if (!isValidIPFSHash(metadataObject.uri)) {
        throw new Error('Invalid IPFS hash format');
      }

      _tokenIdList[tokenIdIndex] = {
        ..._tokenIdList[tokenIdIndex],
        metadataUri: metadataObject.uri
      };
      newMetadata.imageUrl = metadataObject.imageUrl

      await setTokenMetadata(
        currentCampaign,
        currentCollection.tokenMetadata.tokenId,
        metadataObject.uri
      )
      console.log("BURNING DROPS")

      for (let i = 0; i < burnDropArray.length; i++) {
        const drop = burnDropArray[i]
        await burnDrop(walletAddress, currentCampaign, drop)
      }
      await handleUserFeatures()

      setCurrentCollection({ baseCombination: currentCollection.baseCombination, combination: newCombination, tokenMetadata: newMetadata, campaign: currentCampaign })
      onSavedCombinationSnackbar();
    } catch (err) {
      console.log(err, "ERROR SAVING COMBINATION");

      // Restore original metadata URI on error
      _tokenIdList[tokenIdIndex] = {
        ..._tokenIdList[tokenIdIndex],
        metadataUri: originalMetadataUri
      };

      setTokenIdList(_tokenIdList);

      onFailedCombinationSnackbar();
    }
  }

  const handleLogin = (isSigned: boolean, selectedLoginCampaign: Campaign) => {
    setSelectedLoginCampaign(selectedLoginCampaign);
    setIsSigned(isSigned);

  }

  useEffect(() => {
    if (campaignParams) {
      setIsLoading(true);
      setCurrentSection(CitizensSections.View);
    }
  }, [campaignParams])

  const handleFollowUser = async (addressToFollow: string) => {
    if (!signer) return false;
    try {

      const isSuccess = await FollowUser(addressToFollow, signer);
      if (isSuccess) {
        setLeaderboardData(prevData =>
          prevData && prevData.map(entry =>
            entry.address === addressToFollow
              ? { ...entry, isFollowing: true }
              : entry
          )
        );
        showSnackbar(
          <p>You are following to {addressToFollow}</p>
        )
      }
      return isSuccess;
    } catch (error) {
      LogError(Module.Citizens, 'Error following user:', error);
      return false;
    }
  };

  const handleUnfollowUser = async (addressToUnfollow: string) => {
    if (!signer) return false;
    try {
      const isSuccess = await UnfollowUser(addressToUnfollow, signer);
      if (isSuccess) {
        setLeaderboardData(prevData =>
          prevData && prevData.map(entry =>
            entry.address === addressToUnfollow
              ? { ...entry, isFollowing: false }
              : entry
          )
        );
        showSnackbar(
          <p>You unfollowed {addressToUnfollow}</p>
        );
      }
      return isSuccess;
    } catch (error) {
      LogError(Module.Citizens, 'Error unfollowing user:', error);
      return false;
    }
  };

  useEffect(() => {
    if (!isReady || !wallets[0] || signer) return;

    const setupSigner = async () => {
      try {
        const ethProvider = await wallets[0].getEthereumProvider();
        const browserProvider = new BrowserProvider(ethProvider);

        const newSigner = await browserProvider.getSigner();
        setSigner(newSigner);

      } catch (error) {
        console.error('Error setting up signer:', error);
      }
    };

    setupSigner();

  }, [isReady, wallets]);


  useEffect(() => {
    async function fetchLeaderboardData() {
      if (!signer) return
      console.log("FETCHING LEADERBOARD DATA")
      try {
        const response = await fetch('/api/v1/leaderboard');
        if (!response.ok) throw new Error('Failed to fetch leaderboard data');
        const data = await response.json();
        const leaderboardWithProfileData = await Promise.all(data.map(async (entry: LeaderboardEntry) => {
          const profileData = await GetUniversalProfileData(entry.address);
          return {
            ...entry,
            name: profileData.name,
            profileImage: profileData.profileImage,
            isFollowing: false // Initialize isFollowing
          };
        }));

        // If we have a signer, get follow statuses
        const followStatuses = await GetFollowStatuses(leaderboardWithProfileData, signer);
        leaderboardWithProfileData.forEach(entry => {
          entry.isFollowing = followStatuses[entry.address] || false;
        });
        setLeaderboardData(leaderboardWithProfileData);
      } catch (error) {
        setLeaderboardData(undefined);
        LogError(Module.Citizens, 'Error fetching leaderboard data:', error);
      }
    }

    fetchLeaderboardData();
  }, [signer]);

  const handleLogout = useCallback(async () => {
    await logout();
    setSigner(undefined);
    setIsSigned(false);
    closeConnection();
    setCurrentCollection({
      campaign: campaignParams?.campaign as Campaign,
      combination: '',
      baseCombination: '',
      tokenMetadata: {} as TokenMetadata
    })
    setLoadedTokens(undefined)
  }, [logout]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] font-work">
      {isSigned ?
        <>
          {/* EDITOR HUD */}
          <div className="fixed w-full z-10 dark">
            {currentCollection.combination && campaignParams && campaignParams.campaign && currentSection === CitizensSections.View &&
              <HudUI
                selectedOption={selectedOpc.find(
                  (e) => e.id === selectedCategory
                )}
                editModeSelected={
                  isEditModeSelected
                }
                selectListCategory={
                  (campaignParams.features &&
                    campaignParams.accessories && [
                      ...campaignParams.features,
                      ...campaignParams.accessories,
                    ]) ||
                  []
                }
                // optionList
                optionList={optionListShow}
                // selectedCategory
                selectedCategory={selectedCategory}
                campaignSkinColorConfig={
                  campaignParams?.config.skin ||
                  {}
                }
                skinColor={skinColor}
                changeView={() => {
                  saveCombination()
                  setIsEditModeSelected(!isEditModeSelected)
                  // void updateStage(!isEditModeSelected) @GabCh15 tiene la misma funcionalidad de lukso?
                }}
                // changeCategory
                onOptionChange={(id, path, name) =>
                  void onOptionChange(
                    id,
                    path,
                    name
                  )
                }
                // onCategoryChange
                onCategoryTypeChange={(value) =>
                  onCategoryTypeChange(value)
                }
                onSkinColorChange={(value) =>
                  void onClickChangeSkinColor(
                    value
                  )
                }
                exportModel={() => exportModel()}
                isCustomCampaignHud
                onClickBackButton={() =>
                  setIsEditModeSelected(false)
                }
                isLoading={isLoading}
              />
            }
          </div>
          {/* CANVAS */}
          <div className="fixed left-[50%] translate-x-[-50%] flex justify-center xl:justify-end items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
            {currentCollection.combination && campaignParams && campaignParams.campaign && (currentSection === CitizensSections.View || currentSection === CitizensSections.Mint) && userWearables && <AvatarEditor

              avatarBasePath={
                campaignParams.armature
              }
              editMode={isEditModeSelected}
              lights={
                campaignParams.config.lights
              }
              defaultShadow={
                campaignParams.config
                  .defShadow
              }
              defaultCamera={
                campaignParams.config.defCam
              }
              postProcessing={
                campaignParams.config
                  .postProcessing
              }
              onReady={() =>
                onAvatarBuilderReady(
                  currentCollection.combination,
                  currentCollection.campaign
                )
              }
            />}
          </div>
          {/* CITIZENS HUD */}
          {!isEditModeSelected && signer &&
            <CitizensUI
              isSavingCombination={isSavingCombination}
              currentSection={currentSection}
              loadedTokens={loadedTokens}
              currentCollection={currentCollection}
              updateCollection={updateCollection}
              features={singleInitData?.features}
              exportModel={() => exportModel()}
              address={walletAddress ?? ""}
              leaderboardData={leaderboardData}
              signer={signer}
              handleFollowUser={handleFollowUser}
              handleUnfollowUser={handleUnfollowUser}
              claimableDrops={claimableDrops}
              handleClaim={handleClaim} />
          }
          {/* LOADER */}
          {isLoading &&
            <div className={`fixed ${isEditModeSelected ? 'xl:w-[42%] right-0 top-0' : 'inset-0'} w-full h-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-[#151515] to-[#0C0C0C]`}>
              <p className=" text-white text-xl font-light">Loading Citizen</p>
              <div className="w-4 h-4 border-t rounded-full animate-spin"></div>
            </div>
          }
        </>
        :
        <>
          {isLoggedIn &&
            <div className={`fixed z-50 ${isEditModeSelected ? 'xl:w-[42%] right-0 top-0' : 'inset-0'} w-full h-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-[#151515] to-[#0C0C0C]`}>
              <p className=" text-white text-xl font-light">Loading session</p>
              <div className="w-4 h-4 border-t rounded-full animate-spin"></div>
            </div>
          }
          <LoginUI
            collections={collectionList}
            setIsSigned={(isSigned: boolean, selectedCampaign: Campaign) => handleLogin(isSigned, selectedCampaign)}
          />
        </>
      }
      {/* HEADER */}
      <div className="fixed inset-0 w-full h-fit flex justify-between items-center pt-8 px-6">
        {/* LOGO THE HUB */}
        <div className="w-fit h-fit" onClick={() => setCurrentSection(CitizensSections.Mint)}>
          <LogoTheHub />
        </div>
        {/* NAVBAR */}
        {isSigned && !isEditModeSelected && tokenIdList && tokenIdList?.length > 0 &&
          <>
            <div className={`fixed z-50 xl:relative inset-6 xl:inset-0 bg-citizens-dark xl:bg-inherit h-fit ${isBurguerOpen ? 'block' : 'hidden xl:block'}`}>
              <div className='w-full px-4 pt-4 pb-24 flex justify-between xl:hidden'>
                <Image
                  src='/resources/images/the-hub-logo-white.svg'
                  alt="the hub icon"
                  width={182}
                  height={32}
                />
                <div className={`w-10 h-[27px] border border-white rounded-full flex justify-center items-center`} onClick={() => setIsBurguerOpen(false)}>
                  <div className='w-1/3 h-px bg-white'></div>
                </div>
              </div>
              <div className='xl:flex gap-4 pb-8 xl:pb-0 px-4'>
                <Button label="homebase" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                  if (currentSection !== CitizensSections.View) {
                    setIsLoading(true);
                    setCurrentSection(CitizensSections.View);
                  }
                  setIsBurguerOpen(false);
                }} />
                <Button label="Wardrobe" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                  if (currentSection !== CitizensSections.View) {
                    setIsLoading(true);
                    setCurrentSection(CitizensSections.View);
                  }
                  setIsBurguerOpen(false);
                  if (!isSavingCombination) setIsEditModeSelected(true);
                }}>
                  {isSavingCombination ?
                    <div className="w-3 h-3 rounded-full border-t-[1px] border-white animate-spin" />
                    :
                    <ArrowLinkSVG />
                  }
                </Button>
                <Button label="Backpack" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                  setIsLoading(false);
                  setIsBurguerOpen(false);
                  setCurrentSection(CitizensSections.Collection);
                }} />
                <Button label="leaderboard" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                  setIsLoading(false);
                  setIsBurguerOpen(false);
                  setCurrentSection(CitizensSections.LeaderBoard);
                }} />
                <Button label="play" withIcon className="w-full xl:min-w-min h-fit px-4 !shadow-none xl:!shadow-citizens-btn" textStyles="text-[32px] xl:!text-base 2xl:!text-lg text-start xl:text-center" handleClick={() => {
                  setIsLoading(false);
                  setIsBurguerOpen(false);
                  setCurrentSection(CitizensSections.Play);
                }} />
              </div>
              <div className='border-t-[1px] mx-4 xl:hidden'>
                <p className='text-center text-xs text-white font-light pt-8'>Follow us</p>
                <SocialButtons className='flex gap-4 w-full justify-center pt-4 pb-8' />
              </div>
            </div>
            <div className='grid w-[18px] gap-[6px] xl:hidden order-3' onClick={() => setIsBurguerOpen(true)}>
              <div className='w-full h-[2px] bg-white'></div>
              <div className='w-full h-[2px] bg-white'></div>
              <div className='w-full h-[2px] bg-white'></div>
            </div>
          </>
        }
        {/* CONNECT BUTTON */}
        {(collectionList || collectionList === null || isSigned) &&
          <div className="flex gap-4">
            {/* {!isSigned &&
                <Button label="About" handleClick={() => { }} withIcon textStyles="text-start pl-2">
                  <ArrowLinkSVG />
                </Button>
              } */}
            <ConnectButton
              isSigned={isSigned}
              setIsSigned={setIsSigned}
              address={walletAddress}
              onLogout={handleLogout}
            />
          </div>
        }
      </div>
      {/* SOCIAL */}
      {!isSigned &&
        <SocialButtons className='hidden lg:flex fixed bottom-8 right-6 gap-4' />
      }
      {
        isLoggedIn === undefined &&
        <div className={`fixed z-50 ${isEditModeSelected ? 'xl:w-[42%] right-0 top-0' : 'inset-0'} w-full h-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-[#151515] to-[#0C0C0C]`}>
          <p className=" text-white text-xl font-light">Verifing session</p>
          <div className="w-4 h-4 border-t rounded-full animate-spin"></div>
        </div>
      }
    </div>
  )
}
