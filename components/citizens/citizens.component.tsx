import { BasicData, CampaignParameters, ExportInterface, LookAtVectors } from "../../interfaces/common.interface";
import MobileLayout from "../../layouts/mobile.layout";
import { Campaign, CampaignDrops, TokenId, TokenMetadata } from "../../types/metadata.type";
import LoginUI from "../../ui/citizens/sections/login.ui";
import Image from "next/image";
import ConnectButton from "../../ui/citizens/common/connectButton.ui";
import CitizensUI from "../../ui/citizens/citizens.ui";
import { useConnectWallet } from "@web3-onboard/react";
import { getCampaignsTokenIds } from "../../utils/web3/contract.util";
import { CitizensCollection } from "../../interfaces/citizens.interface";
import Button from "../../ui/citizens/common/button.ui";
import ArrowLinkSVG from "../../ui/citizens/common/SVG/arrowLinkSVG.ui";
import SocialDiscordSVG from "../../ui/citizens/common/SVG/socialDiscordSVG.ui";
import Link from "next/link";
import SocialInstagramSVG from "../../ui/citizens/common/SVG/socialInstagramSVG.ui";
import SocialXSVG from "../../ui/citizens/common/SVG/socialXSVG.ui";
import { CitizensSections, TheHubSocialLinks } from "../../enums/citizens/common.enum";
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
import { GetAccessoryListByCampaign, GetEnvMapListByCampaign, GetAvatarSingleByCampaignCombinationString, GetAvatarSingleByCampaignCombination, GetAssetsListByCampaign, GetAnimationByCampaignAndName, FetchBlob } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { FilterList, LogError, MixArrays } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { fileCampaignNameLabel } from "../../constants/lukso/labels.constant";
import { SaveFile } from "../../utils/exporter.util";
import { StorageLocation } from "../../enums/firebase.enum";
import { useCallback, useEffect, useState } from "react";
import HudUI from "../../ui/avatar/hud.ui";
import { AGChangeCamPosition, AGChangeLookAtPosition } from "../avatar/viewer.component";

const COLLECTIONS: CitizensCollection[] = [
  {
    name: 'Lukso Citizens',
    image: '/resources/images/campaings/citizens_collection_image.png'
  },
  {
    name: 'Lukso Creators',
    image: '/resources/images/campaings/creators_collection_image.png'
  },
]


interface CitizensComponentProps {
  campaignParams?: CampaignParameters;
  setCampaign: (campaign?: Campaign) => void;
}

const exportData: ExportInterface = { attributes: [] }
let envMapList: EnvMapInterface[] | undefined
let singleInitData: SingleInterface | undefined
let accessoryList: FeatureInterface[] | undefined
let optionList: FeatureInterface[] | undefined
let featureList: FeatureInterface[] | undefined


export default function CitizensComponent({ campaignParams, setCampaign }: CitizensComponentProps) {
  const [isSigned, setIsSigned] = useState<boolean>(true); // false: log out, true: logged in
  const [collectionList] = useState<CitizensCollection[] | null | undefined>(COLLECTIONS); // collections to show before login, it controls the view flow: undefined: loading state, null: error getting data, CitizensCollection[]: show collections
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<CitizensSections>(CitizensSections.Collection);

  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined)

  const [{ wallet }] = useConnectWallet()

  const [loadedTokens, setLoadedTokens] = useState<TokenMetadata[]>([]);

  const [currentCollection, setCurrentCollection] = useState<CollectionType>({
    campaign: campaignParams?.campaign as Campaign,
    baseCombination: '',
    tokenMetadata: {} as TokenMetadata
  });

  // Edit state
  const [isEditModeSelected, setIsEditModeSelected] = useState<boolean>(false);
  const [optionListShow, setOptionListShow] = useState<FeatureInterface[]>();
  const [dropList,] = useState<CampaignDrops>({
    vrm_male: [],
    vrm_female: [],
  });
  const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(
    exportData.attributes
  );
  const [skinColor, setSkinColor] = useState<string>(
    campaignParams?.config.skin?.defColor ?? 'FFFFFF'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('head');
  const [tokenIdList, setTokenIdList] = useState<TokenId[]>();
  // const [selectedCombination, setSelectedCombination] = useState<string>();
  // const [selectedBaseCombination, setSelectedBaseCombination] = useState<string>();
  // const [selectedTokenId, setSelectedTokenId] = useState<number>();
  // const [selectedMetadata, setSelectedMetadata] = useState<TokenMetadata>();

  const updateCollection = useCallback((newCampaign: Campaign, newCombination: string, tokenMetadata: TokenMetadata) => {
    const newCollection: CollectionType = {
      campaign: newCampaign, baseCombination: newCombination,
      tokenMetadata
    };
    console.log('newCollection: ', newCollection);
    setCurrentCollection(newCollection);
    setCampaign(newCollection.campaign); // This updates the parent state
  }, [setCampaign]);

  // Function to update avatar features based on the current base combination
  const updateAvatarFeatures = useCallback(async () => {
    /* if (currentCollection.baseCombination && currentCollection.campaign) {
      // Fetch the single data for the new combination
      await getSingleData(currentCollection.campaign, currentCollection.baseCombination);
      
      // Update the features data
      await SetFeaturesData(campaignParams?.features ?? []);

      // Load the new features onto the avatar
      await loadSingleData();
    } */
  }, [currentCollection.baseCombination, currentCollection.campaign, campaignParams]);

  // Use effect to listen for changes in currentCollection.baseCombination
  useEffect(() => {
    // Call the function to update avatar features when baseCombination changes
    void updateAvatarFeatures();
  }, [updateAvatarFeatures]);

  useEffect(() => {
    if (!isSigned || !wallet) return

    const address = wallet.accounts[0].address

    setWalletAddress(address.toLowerCase())
  }, [isSigned])

  useEffect(() => {
    if (!walletAddress) return
    const getTokensMetadataPromise = async () => {
      const tokenIds = await getCampaignsTokenIds(walletAddress)
      setTokenIdList(tokenIds)
    }
    void getTokensMetadataPromise()
  }, [walletAddress])

  useEffect(() => {
    const loadTokenMetadata = async () => {
      if (tokenIdList) {
        const promises = tokenIdList.map(async (tokenIdMetadata, i) => {
          try {
            const tokenMetadata = await getTokenMetadata(tokenIdMetadata);
            if (i == 0) {
              updateCollection(tokenMetadata.campaign as Campaign, tokenMetadata.baseCombination, tokenMetadata)
            }
            setLoadedTokens(prevTokens => [...prevTokens, tokenMetadata]);
            return tokenMetadata;
          } catch (error) {
            console.error(`Error loading metadata for token ${tokenIdMetadata.tokenId}:`, error);
            return null;
          }
        });

        await Promise.all(promises);
      }
    };

    loadTokenMetadata();
  }, [tokenIdList]);

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
    const result = await GetAssetsListByCampaign(campaignParams?.campaign)
    featureList = result.success ? result.value : undefined
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

    const campaignDropList =
      dropList[campaignParams?.campaign as keyof typeof dropList]
    if (campaignDropList) {
      const formattedDropList = campaignDropList
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
      filteredOptionList = filteredOptionList.concat(formattedDropList)
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
    console.log('currentCombination: ', currentCombination);
    console.log('campaign: ', campaign);
    if (!campaign) return

    console.log('onAvatarBuilderReady');

    await Promise.all([
      getEnvironmentMapList(),
      getSingleInfo(),
      getSingleData(campaign, currentCombination),
    ])

    await SetFeaturesData(campaignParams?.features ?? [])

    const bgMap = envMapList?.find(
      (em) => em.name === campaignParams?.config.envMap?.defBgMap
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
    const vrmStorageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${campaignParams?.campaign}%2F${StorageLocation.AvatarVrms}%2F${currentCollection.baseCombination}.vrm?alt=media&token=ad2e1e79-6c26-4284-92c3-2e42f5166b42`
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

  return (
    <MobileLayout>
      <div className="w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] font-work">
        {!isSigned ?
          <LoginUI collections={collectionList} setIsSigned={(isSigned) => { setIsSigned(isSigned) }} />
          :
          <>
            {/* EDITOR HUD */}
            <div className="fixed z-10 dark">
              {currentCollection.baseCombination && campaignParams && campaignParams.campaign && currentSection === CitizensSections.View &&
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
                    // saveCombination() @GabCh15 tiene la misma funcionalidad de lukso?
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
              {currentCollection.baseCombination && campaignParams && campaignParams.campaign && currentSection === CitizensSections.View && <AvatarEditor

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
                    currentCollection.baseCombination,
                    currentCollection.campaign
                  )
                }
              />}
            </div>
            {/* CITIZENS HUD */}
            {!isEditModeSelected &&
              <CitizensUI
                currentSection={currentSection}
                loadedTokens={loadedTokens}
                currentCollection={currentCollection}
                updateCollection={updateCollection}
                features={singleInitData?.features} exportModel={() => exportModel()} address={walletAddress ?? ""} />
            }
          </>
        }
        {/* LOADER */}
        {
          isLoading &&
          <div className={`fixed ${isEditModeSelected ? 'xl:w-[42%] right-0 top-0' : 'inset-0'} w-full h-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-[#151515] to-[#0C0C0C]`}>
            <p className=" text-white text-xl font-light">Loading Citizen</p>
            <div className="w-4 h-4 border-t rounded-full animate-spin"></div>
          </div>
        }
        {/* HEADER */}
        <div className="fixed inset-0 w-full h-fit flex justify-between items-center pt-8 px-6">
          {/* LOGO THE HUB */}
          <div className="w-fit h-fit">
            <Image
              src='/resources/images/the-hub-logo-white.svg'
              alt="the hub icon"
              width={182}
              height={32}
            />
          </div>
          {/* NAVBAR */}
          {isSigned && !isEditModeSelected &&
            <div className="flex gap-4">
              <Button label="homebase" withIcon className="min-w-min h-fit pl-4" textStiles="!text-base 2xl:!text-lg" handleClick={() => {
                if (currentSection !== CitizensSections.View) {
                  setIsLoading(true);
                  setCurrentSection(CitizensSections.View);
                }
                
              }} />
              <Button label="backpack" withIcon className="min-w-min h-fit pl-4" textStiles="!text-base 2xl:!text-lg" handleClick={() => {
                if (currentSection !== CitizensSections.View) {
                  setIsLoading(true);
                  setCurrentSection(CitizensSections.View);
                }
                setIsEditModeSelected(true);
              }} />
              <Button label="collection" withIcon className="min-w-min h-fit pl-4" textStiles="!text-base 2xl:!text-lg" handleClick={() => {
                setIsLoading(false)
                setCurrentSection(CitizensSections.Collection)
              }} />
              <Button label="leaderboard" withIcon className="min-w-min h-fit pl-4" textStiles="!text-base 2xl:!text-lg" handleClick={() => { }} />
              <Button label="play" withIcon className="min-w-min h-fit pl-4" textStiles="!text-base 2xl:!text-lg" handleClick={() => { }} />
            </div>
          }
          {/* CONNECT BUTTON */}
          {(collectionList || collectionList === null || isSigned) &&
            <div className="flex gap-4">
              {!isSigned &&
                <Button label="About" handleClick={() => { }} withIcon textStiles="text-start pl-2">
                  <ArrowLinkSVG />
                </Button>
              }
              <ConnectButton isSigned={isSigned} setIsSigned={(isSigned) => { setIsSigned(isSigned) }} address={walletAddress} />
            </div>
          }
        </div>
        {/* SOCIAL */}
        {!isSigned &&
          <div className="fixed bottom-8 right-6 flex gap-4 ">
            <Link href={TheHubSocialLinks.SocialX}>
              <SocialXSVG />
            </Link>
            <Link href={TheHubSocialLinks.SocialInstagram}>
              <SocialInstagramSVG />
            </Link>
            <Link href={TheHubSocialLinks.Discord}>
              <SocialDiscordSVG />
            </Link>
          </div>
        }
      </div>
    </MobileLayout >
  )
}