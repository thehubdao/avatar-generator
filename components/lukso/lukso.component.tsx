import { useEffect, useState } from 'react'
import Image from 'next/image'
// Layout
import MobileLayout from '../../layouts/mobile.layout'

// Components
import AvatarEditor, {
  ChangeFeature,
  ChangeSkinColor,
  ChangeStartAnimation,
  GetAvatarGLB,
  GetAvatarVRM,
  RemoveStage,
  SetEnvironment,
  SetFeaturesData,
  SetStage,
} from '../avatar/editor.component'
import {
  AGChangeCamPosition,
  AGChangeLookAtPosition,
} from '../avatar/viewer.component'
import HudComponent from '../../ui/avatar/hud.ui'

// UI
import LuksoUI from '../../ui/lukso/lukso.ui'
import TransparentBoxUI from '../../ui/lukso/common/transparentBox.ui'

// Enums
import { Module } from '../../enums/common.enum'
import { LuksoSections } from '../../enums/lukso/common.enum'

// Utils
import { FilterList, LogError, MixArrays } from '../../utils/common.util'
import {
  FetchBlob,
  GetAccessoryListByCampaign,
  GetAnimationByCampaignAndName,
  GetAssetsListByCampaign,
  GetAvatarSingleByCampaignCombination,
  GetAvatarSingleByCampaignCombinationString,
  GetEnvMapListByCampaign,
  GetStageListByCampaign,
  PostRequestThumbnailProcessFile,
  PostRequestVRMProcessFile,
} from '../../utils/api.util'
import { fadeInOutBlock } from '../../utils/gsap/block_in_out.util'
import { SaveFile } from '../../utils/exporter.util'


// Interfaces
import {
  EnvMapInterface,
  FeatureInterface,
  SingleInterface,
  StageInterface,
} from '../../interfaces/api.interface'
import {
  BasicData,
  CampaignParameters,
  ExportInterface,
  LookAtVectors,
} from '../../interfaces/common.interface'
import { Campaign, CampaignDrops, TokenId, TokenMetadata } from '../../types/metadata.type'
import { BodyPart } from '../../types/avatar.type'
import { ethers } from 'ethers'
import AccountModalUI from '../../ui/lukso/common/accountModal'
import Loader from '../../ui/lukso/common/loader.ui'
import { useConnectWallet } from '@web3-onboard/react'
import { burnDrop, getCampaignsTokenIds, getUserFeatures, setTokenMetadata } from '../../utils/web3/contract.util'
import LoginUI from '../../ui/lukso/sections/loginSection.ui'
import ListUI from '../../ui/lukso/sections/listSection.ui'
import ConnectWeb3Button from '../web3/connectWeb3.component'
import { uploadMetadata } from '../../utils/metadata.util'
import Toastify from 'toastify-js'
import { SelectableCampaign } from '../../types/common.type'
import { FileCampaignNameLabel } from '../../constants/lukso/labels.constant'

const exportData: ExportInterface = { attributes: [] }
let optionList: FeatureInterface[] | undefined
let featureList: FeatureInterface[] | undefined
let accessoryList: FeatureInterface[] | undefined
let stageList: StageInterface[] | undefined
let envMapList: EnvMapInterface[] | undefined;
let singleInitData: SingleInterface | undefined
let loaderDivElement: HTMLDivElement


const tokenMetadata: TokenMetadata = {
  name: '',
  description: '',
  GLBUrl: '',
  body: {},
  links: [], assets: [],
  tokenId: '',
  campaign: '',
  imageUrl: '',
  combination: '',
  images: [],
  baseCombination: '',
  fallbackImageUrl: ''
}

export default function LuksoComponent({
  campaignParams,
  setCampaign,
}: {
  campaignParams?: CampaignParameters,
  setCampaign: (campaign: Campaign | undefined) => void
}) {
  // Loading flags
  const [currentSection, setCurrentSection] = useState<LuksoSections>(
    LuksoSections.Loading
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Edit state
  const [optionListShow, setOptionListShow] = useState<FeatureInterface[]>()
  const [dropList, setDropList] = useState<CampaignDrops>({ vrm_male: [], vrm_female: [] })
  const [isEditModeSelected, setIsEditModeSelected] = useState<boolean>(false)
  const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(
    exportData.attributes
  )
  const [skinColor, setSkinColor] = useState<string>(
    campaignParams?.config.skin?.defColor ?? 'FFFFFF'
  )
  const [selectedCategory, setSelectedCategory] = useState<string>(
    'head'
  )
  const [tokenIdList, setTokenIdList] = useState<TokenId[]>()
  const [selectedCombination, setSelectedCombination] = useState<string>()
  const [selectedBaseCombination, setSelectedBaseCombination] = useState<string>()
  const [selectedTokenId, setSelectedTokenId] = useState<number>()
  const [selectedMetadata, setSelectedMetadata] = useState<TokenMetadata>()

  // listSection filter state
  const [selectedFilterCampaign, setSelectedFilterCampaign] = useState<string>('all')
  const [selectedFilterTokenId, setSelectedFilterTokenId] = useState<string>('')
  const [selectedDropdownField, setSelectedDropdownField] = useState<SelectableCampaign>()

  // Web3 state
  const [provider, setProvider] = useState<ethers.BrowserProvider>()
  const [addressToShow, setAddressToShow] = useState<string>('')
  const [combinationPictureUrl, setCombinationPictureUrl] = useState<string>(
    ''
  )
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false)
  const [{ wallet }] = useConnectWallet()

  //Notification on save combination

  const saveNotification = Toastify({
    text: "The changes are being saved onchain, it might take up to 4 minutes for them to be effective. Do not leave the app.",
    gravity: "bottom", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    duration: 0,
    className: "!text-[#C25399]",
    style: {
      background: "#FFD9EF",
    },
  })

  const saveErrorNotification = Toastify({
    text: "Error, please try it again!",
    gravity: "bottom", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    duration: 10000,
    className: "!text-[#C25399]",
    style: {
      background: "#FFD9EF",
    },
  })

  useEffect(() => {
    if (!addressToShow) return
    const featuresPromise = async () => {
      const features = await getUserFeatures(addressToShow)

      setDropList(features)
    }
    featuresPromise()
  }, [addressToShow])

  useEffect(() => {
    if (!wallet) return setProvider(undefined)
    const setEtherProviderPromise = () => {
      const _etherProvider = new ethers.BrowserProvider(wallet.provider, 'any')
      setProvider(_etherProvider)
    }
    void setEtherProviderPromise()
  }, [wallet])

  useEffect(() => {
    if (!provider || !wallet) return

    const address = wallet.accounts[0].address

    setAddressToShow(address)

  }, [provider])

  useEffect(() => {
    if (!addressToShow) return
    const getTokensMetadataPromise = async () => {
      const tokenIds = await getCampaignsTokenIds(addressToShow)
      setTokenIdList(tokenIds)
    }
    void getTokensMetadataPromise()
  }, [addressToShow])

  useEffect(() => {
    if (!campaignParams || !campaignParams?.features) return
    setSelectedCategory(campaignParams?.features[0].displayName)
  }, [campaignParams])

  async function onAvatarBuilderReady(currentCombination: string, campaign?: string) {
    if (!campaign) return
    await Promise.all([
      getStageList(),
      getEnvironmentMapList(),
      getSingleInfo(),
      getSingleData(campaign, currentCombination),
    ])



    await SetFeaturesData(campaignParams?.features ?? [])

    const bgMap = envMapList?.find(em => em.name === campaignParams?.config.envMap?.defBgMap);
    const lightMap = envMapList?.find(em => em.name === campaignParams?.config.envMap?.defLightMap);
    await SetEnvironment(bgMap?.path, lightMap?.path, campaignParams?.config.envMap?.skyboxConfig);

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

    // fade loader view
    await handleFadeLoader(loaderDivElement, () => {
      setIsLoading(false)
    })

  }

  async function getFeatureList() {
    const result = await GetAssetsListByCampaign(campaignParams?.campaign)
    featureList = result.success ? result.value : undefined
    optionList = MixArrays(optionList, featureList)
    optionList = MixArrays(optionList, accessoryList)

    const combinationIndexes = selectedBaseCombination?.split('-')
    let filteredOptionList: FeatureInterface[] = []
    //This algorithm can be done in a better way, change it in the future.
    // Get features from combination and make them visible on avatar edit mode.
    combinationIndexes?.forEach((featureIndex: string, index) => {
      const filteredArray = optionList?.filter((val) => {
        const categoryIndex = campaignParams?.features?.find((category) => {
          return category.displayName === val.type
        })?.index

        if (!categoryIndex) return

        return categoryIndex - 1 === index && val.index.toString() === featureIndex
      })

      if (!filteredArray) return

      filteredOptionList = filteredOptionList.concat(filteredArray)
    })

    const campaignDropList = dropList[campaignParams?.campaign as keyof typeof dropList]
    console.log(combinationIndexes)
    if (campaignDropList) {
      const formattedDropList = campaignDropList.map((val) => {
        return optionList?.find((option) => option.type === val.type && val.index === option.index) as FeatureInterface
      }).filter((val) => {
        const categoryIndex = campaignParams?.features?.find((category) => {
          return category.displayName === val.type
        })?.index

        if (!categoryIndex || !combinationIndexes) return true

        return !combinationIndexes[categoryIndex - 1]?.includes(val.index.toString())
      })
      filteredOptionList = filteredOptionList.concat(formattedDropList)
    }

    optionList = filteredOptionList
    const filteredList = FilterList(optionList, 'type', selectedCategory)
    console.log(filteredOptionList, "FILTERED LIST", selectedBaseCombination)
    return setOptionListShow(filteredList)

  }

  async function getAccessoryList() {
    const result = await GetAccessoryListByCampaign(campaignParams?.campaign)
    accessoryList = result.success ? result.value : undefined
  }

  async function getStageList() {
    const result = await GetStageListByCampaign(campaignParams?.campaign)
    stageList = result.success ? result.value : undefined
  }

  async function getEnvironmentMapList() {
    if (!campaignParams?.campaign) return
    const result = await GetEnvMapListByCampaign(campaignParams?.campaign);
    envMapList = result.success ? result.value : undefined;
  }

  async function getSingleInfo() {
    if (campaignParams?.config.defAvatarCombination == undefined || !campaignParams?.campaign) return

    const result = await GetAvatarSingleByCampaignCombination(
      campaignParams?.campaign,
      campaignParams.config.defAvatarCombination
    )
    singleInitData = result.success ? result.value : undefined
  }

  async function getSingleData(campaign: string, combination: string) {
    const numResult = await GetAvatarSingleByCampaignCombinationString(
      campaign, combination
    )
    const result: SingleInterface | undefined = numResult.success
      ? numResult.value
      : undefined
    singleInitData = result
    await getAccessoryList()
    await getFeatureList()


    singleInitData?.features.forEach((feature) => { addReplaceAttribute(feature.val.type, feature.val.name) })
  }

  async function loadSingleData() {
    setIsLoading(true)
    // Iterate the features
    // Place the features on the model
    if (singleInitData === undefined)
      return void LogError(Module.Lukso, 'Missing single data!!!!!')

    for (const {
      val
    } of singleInitData.features) {
      const { id, path, type, name } = val
      const bodyIndex: keyof typeof tokenMetadata.body = val.type.toLowerCase() as keyof typeof tokenMetadata.body
      tokenMetadata.body[bodyIndex] = val as BodyPart
      // Set feature on model
      await ChangeFeature(
        id,
        path,
        name,
        type,
        campaignParams?.config.skin?.defColor ?? 'ffffff'
      )
    }
  }

  async function updateStage(isEditMode: boolean) {
    if (isEditMode) {
      RemoveStage()
    } else {
      const defStage = stageList?.find(
        (stg) => stg.name == campaignParams?.config.defStage
      )
      await SetStage(defStage?.path)
    }
  }

  async function onOptionChange(
    id: string,
    path: string,
    name: string,
    _selectedCategory: string = selectedCategory
  ) {
    const currentFeatures = singleInitData?.features
    const changedFeature = optionList?.find((feature) => feature.type === _selectedCategory && feature.id === id)
    const currentFeaturesTypeIndex = currentFeatures?.findIndex((feature) => feature.val.type === _selectedCategory)

    if (currentFeaturesTypeIndex != undefined && changedFeature && singleInitData) {
      singleInitData.features[currentFeaturesTypeIndex].val = changedFeature
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

  //Saves avatar new combination to NFT metadata
  async function saveCombination() {
    const newCombination = singleInitData?.features.map((feature) => feature.val.index).join('-')
    const currentCampaign = campaignParams?.campaign as Campaign
    const currentFeatures = singleInitData?.features

    if (newCombination == selectedCombination || !campaignParams || !campaignParams.campaign || !selectedTokenId || !newCombination || !selectedMetadata) return

    setCombinationPictureUrl('')
    setSelectedCombination(newCombination)
    saveNotification.showToast()

    const newMetadata = selectedMetadata
    newMetadata.combination = newCombination
    newMetadata.attributes = []

    const _tokenIdList = tokenIdList?.slice() as TokenId[]

    const tokenIdIndex = _tokenIdList?.findIndex(({ tokenId }) => Number(tokenId) === selectedTokenId)

    const originalMetadataUri = _tokenIdList[tokenIdIndex].metadataUri

    _tokenIdList[tokenIdIndex].metadataUri = 'LOADING'

    setTokenIdList(_tokenIdList.slice())
    try {
      const thumbnailBlob = (currentCampaign == 'vrm_female') ? undefined : await getAvatarThumbnail()

      const burnDropArray: BodyPart[] = []
      //NOTE: female campaign has it's types different from the DB
      const femaleCampaignBodyTypes = { head: 'hair', face: 'accesories', legs: 'legs', chest: 'chest', shoes: 'feet' }

      currentFeatures?.forEach((feature) => {
        newMetadata.attributes?.push({ key: currentCampaign == 'vrm_female' ? femaleCampaignBodyTypes[feature.val.type.toLowerCase() as keyof typeof femaleCampaignBodyTypes] : feature.val.type.toLowerCase(), value: feature.val.name, type: 'string' })
        const bodyFeature = newMetadata.body[feature.val.type.toLowerCase() as keyof typeof newMetadata.body]

        if (bodyFeature && bodyFeature.name != feature.val.name) {
          newMetadata.body[feature.val.type.toLowerCase() as keyof typeof newMetadata.body] = feature.val as BodyPart

          burnDropArray.push(feature.val as BodyPart)
        }
      })

      const metadataObject = await uploadMetadata(newMetadata, thumbnailBlob, newCombination, currentCampaign)

      _tokenIdList[tokenIdIndex].metadataUri = metadataObject.uri

      setTokenIdList(_tokenIdList.slice())
      const metadataUrl = `ipfs://${metadataObject.uri}`
      await setTokenMetadata(currentCampaign, selectedTokenId, newMetadata, metadataUrl)
      setCombinationPictureUrl(metadataObject.imageUrl)

      for (let i = 0; i < burnDropArray.length; i++) {
        const drop = burnDropArray[i];
        await burnDrop(addressToShow, currentCampaign, drop)

      }
      saveNotification.hideToast()
    } catch (err) {
      console.log(err)
      _tokenIdList[tokenIdIndex].metadataUri = originalMetadataUri
      onBackView()
      saveNotification.hideToast()
      saveErrorNotification.showToast()
      setTokenIdList(_tokenIdList?.slice())
    }
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

  async function handleFadeLoader(
    elementReference: HTMLDivElement,
    thenFunction?: () => void
  ) {
    await fadeInOutBlock(elementReference, 1, true, thenFunction)
  }

  function getloaderDivElement(elementReference: HTMLDivElement) {
    loaderDivElement = elementReference
  }

  async function exportModel() {
    exportData.attributesBase64 = window.btoa(
      JSON.stringify(exportData.attributes)
    )
    const [picturePromise, modelGLBPromise, modelVRMPromise] = await Promise.all([
      FetchBlob(combinationPictureUrl),
      GetAvatarGLB(),
      GetAvatarVRM()
    ]);
    console.log("EXPORTING VRM, GLB and image...")
    const modelVRM = modelVRMPromise.success ? modelVRMPromise.value : undefined;
    const modelGLB = modelGLBPromise.success ? modelGLBPromise.value : undefined;
    const filesName = FileCampaignNameLabel[campaignParams?.campaign as Campaign] + selectedTokenId
    if (modelVRMPromise.success && modelGLBPromise.success) {
      const refinedModelVRM = await PostRequestVRMProcessFile(modelVRM as Blob)
      await SaveFile(refinedModelVRM, `${filesName}.vrm`);
      await SaveFile(modelGLB, `${filesName}.glb`);
      await SaveFile(picturePromise, `${filesName}.png`);
    }
  }

  const getAvatarThumbnail = async () => {
    const avatarGLBPromise = await GetAvatarGLB()
    const modelGLB = avatarGLBPromise.success ? avatarGLBPromise.value : undefined;
    const thumbnail = await PostRequestThumbnailProcessFile(modelGLB as Blob)
    return thumbnail
  }

  function formatearString(inputString: string): string {
    if (inputString.length < 8) {
      return 'El string debe tener al menos 8 caracteres'
    }

    const primerosCuatro = inputString.slice(0, 4)
    const ultimosCuatro = inputString.slice(-4)

    return `(${primerosCuatro}...${ultimosCuatro})`
  }

  const onBackView = () => {
    setSelectedCombination(undefined)
    setCampaign(undefined)
    setSelectedCategory('head')
    setOptionListShow([])
    singleInitData = undefined
    optionList = []
  }

  return (
    <MobileLayout>
      <>
        {/* LOGIN */}
        {!provider &&
          <LoginUI />
        }
        {/* MAIN VIEW */}
        {provider &&
          <div className="w-full h-screen bg-client-primary flex flex-col">
            {/* ACCOUNT MODAL */}
            {isAccountModalOpen &&
              (
                <AccountModalUI
                  addressAccount={addressToShow}
                  formatAddress={formatearString(addressToShow)}
                  setIsAccountModalOpen={(value) =>
                    setIsAccountModalOpen(value)
                  }
                  onDisconnect={() => {
                    setCurrentSection(LuksoSections.Main)
                    setSelectedBaseCombination(undefined)
                    setSelectedCombination(undefined)
                    setTokenIdList(undefined)
                  }}
                />
              )
            }
            {/* HEADER TAB */}
            <div className='z-10'>
              <TransparentBoxUI
                fullWidth
                border
                backgroundColorClass="bg-client-primary"
                opacityPercentage="50"
                borderColorClass="border-white"
                borderSizeClass="border-2"
                heightClass="h-14"
                paddingClass="pl-11"
                alignItemsClass="items-stretch"
              >
                <div className="flex flex-row justify-between h-full">
                  {/* LOGO UI */}
                  <Image
                    src="resources/icons/campaigns/portal.svg"
                    width={106}
                    height={24}
                    alt="Lukso icon"
                  />
                  {/* WALLET/CONNECT BUTTON UI */}
                  {provider ?
                    (
                      <button
                        className="h-full w-48 flex justify-center items-center border-l-2 border-white px-2"
                        onClick={() => setIsAccountModalOpen(true)}
                      >
                        <p className="truncate h-fit text-white">
                          {formatearString(addressToShow)}
                        </p>
                      </button>
                    ) : (
                      <ConnectWeb3Button
                        classStyles={
                          'w-48 border-l-2 border-white font-bold text-white'
                        }
                        onConnect={() => { }}
                      >
                        <> Login with your UP!</>
                      </ConnectWeb3Button>
                    )
                  }
                </div>
              </TransparentBoxUI>
            </div>
            {/* COLLECTION LIST */}
            {!selectedCombination &&
              <ListUI
              tokenIdList={tokenIdList}
              provider={provider}
              onClickViewButton={(_campaign: Campaign, _combination: string, _baseCombination: string, _combinationPictureUrl: string, _tokenMetadata: TokenMetadata, _tokenId: number) => {
                setIsLoading(true)
                if (campaignParams?.campaign != _campaign) setCampaign(_campaign)
                if (selectedCombination != _combination) setSelectedCombination(_combination)
                if (selectedBaseCombination != _baseCombination) setSelectedBaseCombination(_baseCombination)
                if (combinationPictureUrl != _combinationPictureUrl) setCombinationPictureUrl(_combinationPictureUrl)
                if (selectedMetadata != _tokenMetadata) setSelectedMetadata(_tokenMetadata)
                if (selectedTokenId != _tokenId) setSelectedTokenId(_tokenId)
                setIsEditModeSelected(false)
                setCurrentSection(LuksoSections.Edit)
              } }
              onClickEditButton={(_campaign: Campaign, _combination: string, _baseCombination: string, _combinationPictureUrl: string, _tokenMetadata: TokenMetadata, _tokenId: number) => {
                setIsLoading(true)
                if (campaignParams?.campaign != _campaign) setCampaign(_campaign)
                if (selectedCombination != _combination) setSelectedCombination(_combination)
                if (selectedBaseCombination != _baseCombination) setSelectedBaseCombination(_baseCombination)
                if (combinationPictureUrl != _combinationPictureUrl) setCombinationPictureUrl(_combinationPictureUrl)
                if (selectedMetadata != _tokenMetadata) setSelectedMetadata(_tokenMetadata)
                if (selectedTokenId != _tokenId) setSelectedTokenId(_tokenId)
                setIsEditModeSelected(true)
                setCurrentSection(LuksoSections.Edit)
              } } selectedCampaign={selectedFilterCampaign} setSelectedCampaign={setSelectedFilterCampaign} selectedTokenId={selectedFilterTokenId} setSelectedTokenId={setSelectedFilterTokenId} selectedDropdownField={selectedDropdownField} setSelectedDropdownField={setSelectedDropdownField } />
            }
            {/* CAMPAIGN VIEWER */}
            {selectedCombination && campaignParams?.campaign && campaignParams &&
              <>
                {/* CANVAS WRAPPER */}
                <div className="fixed left-[50%] translate-x-[-50%] flex justify-center xl:justify-end items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
                  {/* CANVAS BACKGROUND */}
                  <div className="w-full h-screen absolute inset-0 bg-client-primary" />
                  {/* CANVAS */}
                  {campaignParams?.campaign &&
                    <AvatarEditor
                      avatarBasePath={campaignParams.armature}
                      editMode={isEditModeSelected}
                      lights={campaignParams.config.lights}
                      defaultShadow={campaignParams.config.defShadow}
                      defaultCamera={campaignParams.config.defCam}
                      postProcessing={campaignParams.config.postProcessing}
                      onReady={() => onAvatarBuilderReady(selectedCombination, campaignParams.campaign)}
                    />
                  }
                </div>
                {/* LOADER */}
                <div className={`fixed inset-0 h-screen w-full flex ${isEditModeSelected ? 'justify-end pr-[22.5rem]' : 'justify-center'} items-center bg-client-primary ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-all duration-1000`}>
                  <div className="scale-[3]">
                    <Loader size={100} />
                  </div>
                </div>
                {/* EDITOR HUD */}
                <div className="fixed z-10">
                  <HudComponent
                    selectedOption={selectedOpc.find(
                      (e) => e.id === selectedCategory
                    )}
                    editModeSelected={isEditModeSelected}
                    selectListCategory={campaignParams.features && campaignParams.accessories && [
                      ...campaignParams.features,
                      ...campaignParams.accessories,
                    ] || []}
                    // optionList
                    optionList={optionListShow}
                    // selectedCategory
                    selectedCategory={selectedCategory}
                    campaignSkinColorConfig={campaignParams?.config.skin || {}}
                    skinColor={skinColor}
                    changeView={() => {
                      saveCombination()
                      setIsEditModeSelected(!isEditModeSelected)
                      void updateStage(!isEditModeSelected)
                    }}
                    // changeCategory
                    onOptionChange={(id, path, name) => void onOptionChange(id, path, name)}
                    // onCategoryChange
                    onCategoryTypeChange={(value) => onCategoryTypeChange(value)}
                    onSkinColorChange={(value) => void onClickChangeSkinColor(value)}
                    exportModel={() => exportModel()}
                    isCustomCampaignHud onClickBackButton={() => setIsEditModeSelected(false)} />
                </div>
                {/* LUKSO HUD */}
                <LuksoUI
                  setIsEditModeSelected={(value) => setIsEditModeSelected(value)}
                  isLoading={false}
                  currentSection={currentSection}
                  getloaderDivElement={(elementReference) => getloaderDivElement(elementReference)}
                  exportModel={() => exportModel()}
                  provider={provider}
                  features={singleInitData?.features}
                  combination={selectedCombination} combinationPictureUrl={combinationPictureUrl}
                  onClickBackButton={onBackView}
                  goEditMode={() => setIsEditModeSelected(true)}
                />
              </>
            }
          </div>
        }
      </>
    </MobileLayout>
  )
}
