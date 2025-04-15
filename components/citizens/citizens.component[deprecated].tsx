'use client'

import { BasicData, CampaignParameters, ExportInterface, LookAtVectors } from "../../interfaces/common.interface";
import { CampaignDrops, TokenId, CitizenMetadata } from "../../interfaces/citizens.interface";
// import LoginUI from "../../ui/citizens/sections/login.ui";
// import ConnectButton from "../../ui/citizens/common/connectButton.ui";
import CitizensUI from "../../ui/citizens/citizens.ui[deprecated]";
import { BurnDrop, GetUserFeatures, SetTokenMetadata } from "../../utils/web3/lukso/contract.util[deprecated]";
import { CitizensCollection, DataBaseDrop } from "../../interfaces/citizens.interface";
import Button from "../../ui/citizens/common/button.ui";
import ArrowLinkSVG from "../../ui/citizens/common/SVG/arrowLinkSVG.ui";
import { Campaign, CitizensSections } from "../../enums/citizens/common.enum";
import { BodyPart, CollectionType } from "../../interfaces/avatar.interface";
import AvatarEditor, {
  ChangeFeature,
  ChangeSkinColor,
  ChangeStartAnimation,
  GetAvatarGLB,
  SetEnvironment,
  SetFeaturesData,
} from '../avatar/editor.component'
import { GetAccessoryListByCampaign, GetEnvMapListByCampaign, GetAvatarSingleByCampaignCombinationString, GetAvatarSingleByCampaignCombination, GetAssetsListByCampaign, GetAnimationByCampaignAndName, FetchBlob } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { FilterList, LogError, MixArrays } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { fileCampaignNameLabel } from "../../constants/lukso/labels.constant";
import { SaveFile } from "../../utils/exporter.util";
import { StorageLocation } from "../../enums/firebase.enum";
import { useCallback, useState } from "react";
import HudUI from "../../ui/avatar/hud.ui";
import { AGChangeCamPosition, AGChangeLookAtPosition } from "../avatar/viewer.component";
import { uploadMetadata } from "../../utils/metadata.util";
import { LeaderboardEntry } from '../../types/leaderboard.type';
import { useSnackbar } from '../../ui/citizens/snackbar/snackbar.provider';
import LogoTheHub from '../../ui/citizens/common/SVG/logoTheHubSVG.ui';
import Image from 'next/image';
import SocialButtons from '../../ui/citizens/common/socialButtons.ui';
import { useBlockchainWallet } from '../../hooks/useBlockchainWallet';
import { Blockchain } from '../../enums/blockchain/common.enum';
import { JsonRpcProvider } from 'ethers';
const COLLECTIONS: CitizensCollection[] = [
  {
    name: 'Lukso Citizens',
    image: '/resources/images/campaings/citizens_collection.jpg',
    campaign: Campaign.Citizens,
    blockChain: Blockchain.Ethereum
  },
  {
    name: 'Lukso Creators',
    image: '/resources/images/campaings/creators_collection.jpg',
    campaign: Campaign.Creators,
    blockChain: Blockchain.Ethereum
  },
  {
    name: 'Kumi',
    image: '/resources/images/campaings/kumi_collection.jpg',
    campaign: Campaign.Kumi,
    blockChain: Blockchain.Solana
  }

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


export default function CitizensComponent({ campaignParams, isLoggedIn, setCampaign }: CitizensComponentProps) {
  const { showSnackbar } = useSnackbar();
/*   const { walletAddress, provider } = useBlockchainWallet(); */
  const [collectionList] = useState<CitizensCollection[] | null | undefined>(COLLECTIONS); // collections to show before login, it controls the view flow: undefined: loading state, null: error getting data, CitizensCollection[]: show collections
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingCombination, setIsSavingCombination] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<CitizensSections>(CitizensSections.View);
  const [isBurguerOpen, setIsBurguerOpen] = useState<boolean>(false);

  const [loadedTokens, ] = useState<CitizenMetadata[]>();

  const [currentCollection, setCurrentCollection] = useState<CollectionType>({
    campaign: campaignParams?.campaign as Campaign,
    combination: '',
    baseCombination: '',
    citizenMetadata: {} as CitizenMetadata
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
  // const [, setSelectedLoginCampaign] = useState<Campaign>();
  const [selectedCategory, setSelectedCategory] = useState<string>('head');
  const [tokenIdList, setTokenIdList] = useState<TokenId[]>();
  const [userWearables, setUserWearables] = useState<CampaignDrops | undefined>(undefined);

  const [claimableDrops, ] = useState<DataBaseDrop[]>([])

  const [leaderboardData, ] = useState<LeaderboardEntry[] | undefined>([]);


  const updateCollection = useCallback((newCampaign: Campaign, newCombination: string, citizenMetadata: CitizenMetadata) => {
    const newCollection: CollectionType = {
      campaign: newCampaign, combination: newCombination,
      citizenMetadata,
      baseCombination: citizenMetadata.baseCombination
    };
    console.log('UPDATE COLLECTION', newCollection)
    setCurrentCollection(newCollection)
    setCampaign(newCollection.campaign)
  }, [setCampaign]);


/*   const getEthereumTokensMetadataPromise = async () => {
    if (!walletAddress) return
    const tokenIds = await GetEthereumCampaignsTokenIds(walletAddress)
    console.log('TOKEN IDS ethereum', tokenIds)
    if (!tokenIds.success) return
    if (tokenIds.value.length <= 0) {
      setCurrentSection(CitizensSections.Collection);
      setIsLoading(false);
      setLoadedTokens([])
    } else {
      setTokenIdList(tokenIds.value)
    }
  } */

/*   const getSolanaTokensMetadataPromise = async () => {
    if (!walletAddress) return
    const asset = await GetCollectionAssetByOwner(solanaWallets[0].address)
    console.log('ASSET', asset)
    if (asset) {
      setCurrentSection(CitizensSections.View);
      setIsLoading(false);
      setTokenIdList([{
        tokenId: asset.publicKey,
        campaign: Campaign.Kumi,
        metadataUri: asset.uri.split('//')[1]
      }])
    }
    else {
      updateCollection(Campaign.Kumi, '0-0-0-0-0-0-0-0-0-0', {} as citizenMetadata)
      if (currentSection !== CitizensSections.Mint) setCurrentSection(CitizensSections.Mint);
      setIsLoading(false);

    }


     else {
    setTokenIdList([{
      tokenId: asset.publicKey,
      campaign: 'kumi',
      metadataUri: asset.uri
    }])
  } 
  } */

  /*   useEffect(() => {
      if (isSolana) {
        console.log("SOLANA GET TOKENS METADATA")
        void getSolanaTokensMetadataPromise()
      } else if (isEthereum) {
        console.log("ETHEREUM GET TOKENS METADATA")
        void getEthereumTokensMetadataPromise()
      }
    }, [walletAddress, isSolana, isEthereum]) */

/*   const loadEthereumTokensMetadata = async () => {
    if (!tokenIdList) return

    let isFirstToken = false;
    try {
      console.log("LOAD ETHEREUM TOKENS METADATA", tokenIdList)
      if (!tokenIdList || tokenIdList.length === 0) return setLoadedTokens([])
      console.log(tokenIdList, 'tokenIdList')
      console.log(loadedTokens, 'loadedTokens')
      tokenIdList.forEach(async (tokenIdMetadata) => {
        try {
          if (!isValidIPFSHash(tokenIdMetadata.metadataUri)) {
            throw new Error('Invalid IPFS hash format');
          }
          const citizenMetadata = await GetEthereumcitizenMetadata(tokenIdMetadata);
          const selectedCampaign = selectedLoginCampaign || Campaign.Citizens
          if (!citizenMetadata.success) return
          if (!isFirstToken && tokenIdMetadata.campaign === selectedCampaign) {
            updateCollection(citizenMetadata.value.campaign as Campaign, citizenMetadata.value.combination, citizenMetadata.value as citizenMetadata)
            isFirstToken = true;
          }

          setLoadedTokens(prevTokens => {
            if (!prevTokens) return [citizenMetadata.value as citizenMetadata];
            return [...prevTokens, citizenMetadata.value as citizenMetadata];
          });
        } catch (error) {
          LogError(Module.Citizens, `Error loading metadata for token ${tokenIdMetadata.tokenId}:`, error);
        }
      })



    } catch (error) {
      LogError(Module.Citizens, 'Error loading token metadata:', error);
    }

  }; */

/*   const loadSolanaTokensMetadata = async () => {
    let isFirstToken = false;
    try {
      console.log("LOAD SOLANA TOKENS METADATA", tokenIdList)
      if (!tokenIdList || tokenIdList.length === 0) return setLoadedTokens([])
      console.log(tokenIdList, 'tokenIdList')
      tokenIdList.forEach(async (tokenIdMetadata) => {
        try {
          if (!isValidIPFSHash(tokenIdMetadata.metadataUri)) {
            throw new Error('Invalid IPFS hash format');
          }
          const citizenMetadata = await GetSolanacitizenMetadata(tokenIdMetadata);
          console.log("TOKEN METADATA", citizenMetadata, isFirstToken, tokenIdMetadata.campaign, selectedLoginCampaign)
          const selectedCampaign = selectedLoginCampaign || Campaign.Kumi
          if (!citizenMetadata.success) return
          if (!isFirstToken && tokenIdMetadata.campaign === selectedCampaign) {
            updateCollection(citizenMetadata.value.campaign as Campaign, citizenMetadata.value.combination, citizenMetadata.value as citizenMetadata)
            isFirstToken = true;
          }

          setLoadedTokens(prevTokens => {
            if (!prevTokens) return [citizenMetadata.value as citizenMetadata];
            return [...prevTokens, citizenMetadata.value as citizenMetadata];
          });
        } catch (error) {
          LogError(Module.Citizens, `Error loading metadata for token ${tokenIdMetadata.tokenId}:`, error);
        }
      })



    } catch (error) {
      LogError(Module.Citizens, 'Error loading token metadata:', error);
    }

  }; */

  //COMMENTED WHILE DEPRECATED COMPONENT IS REMOVED
  /*   useEffect(() => {
      console.log("IS SOLANA", isSolana, "IS ETHEREUM", isEthereum)
      if (loadedTokens && loadedTokens.length > 0) return
      if (isSolana) {
        loadSolanaTokensMetadata();
      } else if (isEthereum) {
        console.log("LOAD ETHEREUM TOKENS METADATA")
        loadEthereumTokensMetadata();
      }
    }, [tokenIdList,isSolana, isEthereum]); */


  const handleEthereumUserFeatures = async () => {
/*     if (!walletAddress) return
    const features = await GetUserFeatures(walletAddress)
    if (!features.success) return
    setUserWearables(features.value) */
  }

  /*   useEffect(() => {
      if (isSolana) {
        // handleSolanaUserFeatures() 
      } else if (isEthereum) {
        handleEthereumUserFeatures()
      }
    }, [walletAddress, isEthereum, isSolana]) */


  /* useEffect(() => {
    if (isSolana) {
      /* void getSolanaFeatureList() 
    } else if (isEthereum) {
      void getEthereumFeatureList()
    }
  }, [userWearables, isEthereum, isSolana]) */


/*   async function fetchEthereumDrops() {
    if (!provider) return
    const drops = await FetchClaimableDrops();
    Promise.all(drops.map(async (drop) => {
      const result = await CheckClaimStatus(drop, provider as unknown as JsonRpcProvider, user?.wallet?.address || '');
      if (!result.success) return
      drop.owned = result.value;
    }))
    setClaimableDrops(drops);
  } */

  /*   useEffect(() => {
  
      if (isSolana) {
         fetchSolanaDrops(); 
      } else if (isEthereum) {
        fetchEthereumDrops();
      }
    }, [provider, isEthereum, isSolana]); */


/*   const handleEthereumClaim = async (drop: DataBaseDrop) => {
    if (!user?.wallet || !provider) return false;

    try {
      const isApproved = await ApproveClaimForUser(user.wallet.address, drop.id)
      if (!isApproved) {
        LogError(Module.Citizens, 'Error claiming drop: is not approved');
        return false;
      }

      const isOwned = await ClaimDrop(drop, provider as unknown as JsonRpcProvider, user.wallet.address);
      if (!isOwned.success) return

      setClaimableDrops(prevDrops =>
        prevDrops.map(d =>
          d.id === drop.id
            ? { ...d, owned: isOwned.value }
            : d
        )
      );

      await handleEthereumUserFeatures();
      return true;
    } catch (error) {
      LogError(Module.Citizens, 'Error claiming drop:', error);
      return false;
    }
  } */


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

  async function getEthereumFeatureList() {
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
    await getEthereumFeatureList();

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
      const { citizenMetadata } = currentCollection;
      const bodyIndex = val.type.toLowerCase() as keyof typeof citizenMetadata.body;
      try {
        citizenMetadata.body[bodyIndex] = val as BodyPart; // Adjust logic to Solana
      } catch (error) {
        console.log("ERROR", error)
      }
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
    console.log("ON AVATAR BUILDER READY", currentCombination, campaign, campaignParams)
    if (!campaign) return
    try {
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
    } catch (error) {
      console.error('Error onAvatarBuilderReady:', error);
      setIsLoading(false)
    }
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
      FetchBlob(currentCollection.citizenMetadata.imageUrl),
      GetAvatarGLB(),
      FetchBlob(vrmStorageUrl),
    ])
    console.log('EXPORTING VRM, GLB and image...')
    const modelVRM = modelVRMPromise
    const modelGLB = modelGLBPromise.success
      ? modelGLBPromise.value
      : undefined
    const filesName =
      fileCampaignNameLabel[campaignParams?.campaign as keyof typeof fileCampaignNameLabel] +
      currentCollection.citizenMetadata.tokenId
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
/*     if (!walletAddress) return

    const newCombination = singleInitData?.features
      .map((feature) => feature.val.index)
      .join('-') as string
    const currentCampaign = campaignParams?.campaign as Campaign
    const currentFeatures = singleInitData?.features
    const newMetadata = currentCollection.citizenMetadata
    newMetadata.combination = newCombination
    newMetadata.attributes = []

    const _tokenIdList = [...tokenIdList as TokenId[]];

    const tokenIdIndex = _tokenIdList.findIndex(
      ({ tokenId }) => tokenId === currentCollection.citizenMetadata.tokenId
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
      if (!isValidIPFSHash(metadataObject.uri)) {
        throw new Error('Invalid IPFS hash format');
      }

      _tokenIdList[tokenIdIndex] = {
        ..._tokenIdList[tokenIdIndex],
        metadataUri: metadataObject.uri
      };
      newMetadata.imageUrl = metadataObject.imageUrl

      await SetTokenMetadata(
        currentCampaign,
        currentCollection.citizenMetadata.tokenId,
        metadataObject.uri
      )

      for (let i = 0; i < burnDropArray.length; i++) {
        const drop = burnDropArray[i]
        await BurnDrop(walletAddress, currentCampaign, drop)
      }
      await handleEthereumUserFeatures()

      setCurrentCollection({ baseCombination: currentCollection.baseCombination, combination: newCombination, citizenMetadata: newMetadata, campaign: currentCampaign })
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
    } */
  }

  /*   useEffect(() => {
      if (campaignParams) {
        setIsLoading(true);
        console.log("CAMPAIGN PARAMS TO VIEW", campaignParams)
        setCurrentSection(CitizensSections.View);
      }
    }, [campaignParams])
   */
/*   const handleFollowUser = async (addressToFollow: string) => {
    if (!provider) return false;
    try {
      const isSuccess = await FollowUser(addressToFollow, provider);
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
  }; */

/*   const handleUnfollowUser = async (addressToUnfollow: string) => {
    if (!provider) return false;
    try {
      const isSuccess = await UnfollowUser(addressToUnfollow, provider);
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
  }; */

  /*   const getEthereumUserFeaturesPromise = async () => {
      if (!provider) return;
      try {
        if (isSolana) {
          // TODO: Solana user features
        } else {
          const features = await GetUserFeatures(walletAddress);
          if (!features.success) return
          setUserWearables(features.value);
        }
      } catch (error) {
        console.error('Error getting user features:', error);
      }
    }; */

  /*   const getSolanaUserFeaturesPromise = async () => {
      //     const features = await getUserFeatures(await signer.getAddress()); 
      setUserWearables({} as CampaignDrops);
  
  
    }; */

  /*   useEffect(() => {
      if (isSolana) {
        void getSolanaUserFeaturesPromise();
      } else {
        void getEthereumUserFeaturesPromise();
      }
    }, [provider, isSolana]);
   */
  /* 
    useEffect(() => {
      if (!walletAddress) return;
      const getTokensMetadataPromise = async () => {
        try {
          if (isSolana) {
            // TODO: Solana tokens
          } else {
            const tokenIds = await GetEthereumCampaignsTokenIds(walletAddress);
            if (!tokenIds.success) return
            if (tokenIds.value.length <= 0) {
              setCurrentSection(CitizensSections.Collection);
              setLoadedTokens([]);
            } else {
              setTokenIdList(tokenIds.value);
            }
          }
        } catch (error) {
          console.error('Error getting tokens:', error);
        } finally {
          // setIsLoading(false);
        }
      };
      void getTokensMetadataPromise();
    }, [walletAddress]); */


 /*  const getEthereumClaimableDropsPromise = async () => {
    try {
      if (!provider) return;
      const drops = await FetchClaimableDrops(walletAddress);
      Promise.all(drops.map(async (drop) => {
        const result = await CheckClaimStatus(drop, provider as unknown as JsonRpcProvider, walletAddress as string);
        if (!result.success) return
        drop.owned = result.value;
      }))
      setClaimableDrops(drops);
    } catch (error) {
      console.error('Error getting claimable drops:', error);
    }
  }; */

  /*   useEffect(() => {
      if (isSolana) {
               // void getSolanaClaimableDropsPromise(); 
      } else if (isEthereum) {
        void getEthereumClaimableDropsPromise();
      }
    }, [provider]); */

  /*   const fetchEthereumLeaderboardData = async () => {
      if (!provider) return;

    try {
      const response = await fetch('/api/v1/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard data');
      const data = await response.json();
      const leaderboardWithProfileData = await Promise.all(data.map(async (entry: LeaderboardEntry) => {
        const profileData = await GetUniversalProfileData(entry.address);
        if (!profileData.success) return
        return {
          ...entry,
          name: profileData.value.name,
          profileImage: profileData.value.profileImage,
          isFollowing: false
        };
      }));
      const followStatuses = await GetFollowStatuses(leaderboardWithProfileData, provider, walletAddress as string);
      leaderboardWithProfileData.forEach(entry => {
        entry.isFollowing = followStatuses[entry.address] || false;
      });
      setLeaderboardData(leaderboardWithProfileData);

    } catch (error) {
      setLeaderboardData(undefined);
      LogError(Module.Citizens, 'Error fetching leaderboard data:', error);
    }
  }

/*   useEffect(() => {

    if (isSolana) {
     //  fetchSolanaLeaderboardData(); 
    } else if (isEthereum) {
      fetchEthereumLeaderboardData();
    }
  }, [provider, isSolana]); */


  // const handleLogout = async () => {
  //   logout();
  //   closeConnection();
  //   setCurrentCollection({
  //     campaign: campaignParams?.campaign as Campaign,
  //     combination: '',
  //     baseCombination: '',
  //     citizenMetadata: {} as CitizenMetadata
  //   })
  //   setLoadedTokens(undefined)
  //   setTokenIdList(undefined)
  //   setClaimableDrops([])
  //   setLeaderboardData(undefined)
  //   setUserWearables({} as CampaignDrops)
  // }


/*   const mintRedirect = () => {
    setTimeout(async () => {
      await getSolanaTokensMetadataPromise()
      setCurrentSection(CitizensSections.View)
    }, 5000)
  } */

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] font-work">
      {isLoggedIn ?

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
            {campaignParams && campaignParams.campaign && (currentSection === CitizensSections.View || currentSection === CitizensSections.Mint) && <AvatarEditor
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
              onReady={() => {
                return onAvatarBuilderReady(
                  currentCollection.combination,
                  currentCollection.campaign
                )
              }
              }
            />}

          </div>
          {/* CITIZENS HUD */}
          {!isEditModeSelected && isLoggedIn &&
            <CitizensUI
            isSavingCombination={isSavingCombination}
            currentSection={currentSection}
            loadedTokens={loadedTokens}
            currentCollection={currentCollection}
            updateCollection={updateCollection}
            features={singleInitData?.features}
            exportModel={() => exportModel()}
            address={''}
            leaderboardData={leaderboardData}
            provider={null}
            /*               handleFollowUser={handleFollowUser}
                          handleUnfollowUser={handleUnfollowUser} */
            claimableDrops={claimableDrops} handleFollowUser={function (): Promise<boolean> {
              throw new Error('Function not implemented.');
            } } handleUnfollowUser={function (): Promise<boolean> {
              throw new Error('Function not implemented.');
            } } handleClaim={function (): Promise<boolean> {
              throw new Error('Function not implemented.');
            } } mintRedirect={function (): void {
              throw new Error('Function not implemented.');
            } }              /* handleClaim={handleEthereumClaim} mintRedirect={mintRedirect} */ />
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
          {/* <LoginUI
            collections={collectionList}
            setSelectedCampaign={(selectedCampaign?: Campaign) => {
              setSelectedLoginCampaign(selectedCampaign)
            }}
          /> */}
        </>

      }
      {/* HEADER */}
      <div className="fixed inset-0 w-full h-fit flex justify-between items-center pt-8 px-6 z-50">
        {/* LOGO THE HUB */}
        <div className="w-fit h-fit" onClick={() => setCurrentSection(CitizensSections.View)}>
          <LogoTheHub />
        </div>
        {/* NAVBAR */}
        {isLoggedIn && !isEditModeSelected && tokenIdList && tokenIdList?.length > 0 &&
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
        {(collectionList || collectionList === null || isLoggedIn) &&
          <div className="flex gap-4">
            {/* {!isSigned &&
                <Button label="About" handleClick={() => { }} withIcon textStyles="text-start pl-2">
                  <ArrowLinkSVG />
                </Button>
              } */}
            {/* <ConnectButton
              isSigned={isAuthenticated}
              address={walletAddress}
              onLogout={handleLogout}
            /> */}
          </div>
        }
      </div>
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
