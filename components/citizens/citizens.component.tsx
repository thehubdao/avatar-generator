import { useEffect, useState } from "react";
import { BasicData, CampaignParameters, ExportInterface } from "../../interfaces/common.interface";
import MobileLayout from "../../layouts/mobile.layout";
import { Campaign, CampaignDrops, TokenId, TokenMetadata } from "../../types/metadata.type";
import LoginUI from "../../ui/citizens/sections/login.ui";
import Image from "next/image";
import ConnectButton from "../../ui/citizens/common/connectButton.ui";
import AvatarEditor, { ChangeFeature, ChangeSkinColor, ChangeStartAnimation, GetAvatarGLB, SetEnvironment, SetFeaturesData } from "../avatar/editor.component";
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
import { FetchBlob, GetAccessoryListByCampaign, GetAnimationByCampaignAndName, GetAssetsListByCampaign, GetAvatarSingleByCampaignCombination, GetAvatarSingleByCampaignCombinationString, GetEnvMapListByCampaign, GetStageListByCampaign } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, SingleInterface, StageInterface } from "../../interfaces/api.interface";
import { FilterList, LogError, MixArrays } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { BodyPart } from "../../types/avatar.type";
import { fileCampaignNameLabel } from "../../constants/lukso/labels.constant";
import { SaveFile } from "../../utils/exporter.util";
import { StorageLocation } from "../../enums/firebase.enum";

const COLLECTIONS: CitizensCollection[] = [
  {
    name: 'Collection 01',
    image: 'https://lipsum.app/id/24/280x300/'
  },
  {
    name: 'Collection 02',
    image: 'https://lipsum.app/id/25/280x300/'
  },
  {
    name: 'Collection 03',
    image: 'https://lipsum.app/id/26/280x300/'
  }
  // {
  //   name: 'Collection 04',
  //   image: 'https://lipsum.app/id/27/280x300/'
  // },
  // {
  //   name: 'Collection 05',
  //   image: 'https://lipsum.app/id/28/280x300/'
  // },
  // {
  //   name: 'Collection 06',
  //   image: 'https://lipsum.app/id/29/280x300/'
  // }
]

const exportData: ExportInterface = { attributes: [] }
let optionList: FeatureInterface[] | undefined
let featureList: FeatureInterface[] | undefined
let accessoryList: FeatureInterface[] | undefined
let stageList: StageInterface[] | undefined
let envMapList: EnvMapInterface[] | undefined
let singleInitData: SingleInterface | undefined

const tokenMetadata: TokenMetadata = {
  name: '',
  description: '',
  GLBUrl: '',
  body: {},
  links: [],
  assets: [],
  tokenId: '',
  campaign: '',
  imageUrl: '',
  combination: '',
  images: [],
  baseCombination: '',
  fallbackImageUrl: '',
}

interface CitizensComponentProps {
  campaignParams?: CampaignParameters;
  setCampaign: (campaign: Campaign | undefined) => void;
}

export default function CitizensComponent({ campaignParams, setCampaign }: CitizensComponentProps) {
  const [isSigned, setIsSigned] = useState<boolean>(true); // false: log out, true: logged in
  const [collectionList] = useState<CitizensCollection[] | null | undefined>(COLLECTIONS); // collections to show before login, it controls the view flow: undefined: loading state, null: error getting data, CitizensCollection[]: show collections

  const [currentSection, setCurrentSection] = useState<CitizensSections>(CitizensSections.View);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined)

  const [{ wallet }] = useConnectWallet()

  // Edit state
  // const [optionListShow, setOptionListShow] = useState<FeatureInterface[]>()
  // const [dropList, setDropList] = useState<CampaignDrops>({
  //   vrm_male: [],
  //   vrm_female: [],
  // })
  // const [isEditModeSelected, setIsEditModeSelected] = useState<boolean>(false)
  // const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(
  //   exportData.attributes
  // )
  // const [skinColor, setSkinColor] = useState<string>(
  //   campaignParams?.config.skin?.defColor ?? 'FFFFFF'
  // )
  // const [selectedCategory, setSelectedCategory] = useState<string>('head')
  // const [tokenIdList, setTokenIdList] = useState<TokenId[]>()
  // const [selectedCombination, setSelectedCombination] = useState<string>('vrm_male')
  // const [selectedBaseCombination, setSelectedBaseCombination] = useState<
  //   string
  // >()
  // const [selectedTokenId, setSelectedTokenId] = useState<number>()
  // const [selectedMetadata, setSelectedMetadata] = useState<TokenMetadata>()

  const [, setOptionListShow] = useState<FeatureInterface[]>()
  const [dropList,] = useState<CampaignDrops>({
    vrm_male: [],
    vrm_female: [],
  })
  const [isEditModeSelected,] = useState<boolean>(false)
  const [, setSelectedOpc] = useState<BasicData[]>(
    exportData.attributes
  )
  const [selectedCategory,] = useState<string>('head')
  const [tokenIdList, setTokenIdList] = useState<TokenId[]>()
  const [selectedCombination,] = useState<string>('vrm_male')
  const [selectedBaseCombination,] = useState<string>()
  const [selectedTokenId, ] = useState<number>()

  const [combinationPictureUrl, ] = useState<string>('')



  useEffect(() => {
    console.log('Campaign params: ', campaignParams);
    setCampaign('vrm_male');
  }, [])

  useEffect(() => {
    if (!isSigned || !wallet) return

    const address = wallet.accounts[0].address

    setWalletAddress(address)
  }, [isSigned])

  useEffect(() => {
    if (!walletAddress) return
    const getTokensMetadataPromise = async () => {
      const tokenIds = await getCampaignsTokenIds(walletAddress)
      setTokenIdList(tokenIds)
    }
    void getTokensMetadataPromise()
  }, [walletAddress])

  async function onAvatarBuilderReady(
    currentCombination: string,
    campaign?: string
  ) {
    if (!campaign) return

    console.log('onAvatarBuilderReady');

    await Promise.all([
      getStageList(),
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

    setIsLoading(false);
  }

  async function loadSingleData() {
    setIsLoading(true)
    // Iterate the features
    // Place the features on the model
    if (singleInitData === undefined)
      return void LogError(Module.Lukso, 'Missing single data!!!!!')

    for (const { val } of singleInitData.features) {
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

  async function getAccessoryList() {
    const result = await GetAccessoryListByCampaign(
      campaignParams?.campaign
    )
    accessoryList = result.success ? result.value : undefined
  }

  async function getStageList() {
    const result = await GetStageListByCampaign(campaignParams?.campaign)
    stageList = result.success ? result.value : undefined
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

  async function getSingleData(campaign: string, combination: string) {
    const numResult = await GetAvatarSingleByCampaignCombinationString(
      campaign,
      combination
    )
    const result: SingleInterface | undefined = numResult.success
      ? numResult.value
      : undefined
    singleInitData = result
    await getAccessoryList()
    await getFeatureList()

    singleInitData?.features.forEach((feature) => {
      addReplaceAttribute(feature.val.type, feature.val.name)
    })
  }

  async function exportModel() {
    exportData.attributesBase64 = window.btoa(
      JSON.stringify(exportData.attributes)
    )
    const vrmStorageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${campaignParams?.campaign}%2F${StorageLocation.AvatarVrms}%2F${selectedCombination}.vrm?alt=media&token=ad2e1e79-6c26-4284-92c3-2e42f5166b42`
    const [
      picturePromise,
      modelGLBPromise,
      modelVRMPromise,
    ] = await Promise.all([
      FetchBlob(combinationPictureUrl),
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
      selectedTokenId
    if (modelVRM && modelGLBPromise.success) {
      await SaveFile(modelVRM, `${filesName}.vrm`)
      await SaveFile(modelGLB, `${filesName}.glb`)
      await SaveFile(picturePromise, `${filesName}.png`)
    }
  }

  return (
    <MobileLayout>
      <div className="w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] font-work">
        {!isSigned ?
          <LoginUI collections={collectionList} />
          :
          campaignParams && campaignParams.campaign ?
            <>
              <div className="fixed inset-0 w-full h-screen">
                <AvatarEditor
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
                      selectedCombination,
                      campaignParams.campaign
                    )
                  }
                />
              </div>
              {/* LOADER */}
              {
                isLoading &&
                <div className="fixed inset-0 w-full h-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-[#151515] to-[#0C0C0C]">
                  <p className=" text-white text-xl font-light">Loading Citizen</p>
                  <div className="w-4 h-4 border-t rounded-full animate-spin"></div>
                </div>
              }
              <CitizensUI currentSection={currentSection} tokenIdList={tokenIdList} features={singleInitData?.features} exportModel={() => exportModel()} />
            </>
            :
            <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
              <p className=" text-white text-xl font-light">Loading Data</p>
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
          {isSigned &&
            <div className="flex gap-4">
              <Button label="homebase" withIcon className="min-w-min h-fit pl-4" textStiles="!text-base 2xl:!text-lg" handleClick={() => { setCurrentSection(CitizensSections.View) }} />
              <Button label="backpack" withIcon className="min-w-min h-fit pl-4" textStiles="!text-base 2xl:!text-lg" handleClick={() => { }} />
              <Button label="collection" withIcon className="min-w-min h-fit pl-4" textStiles="!text-base 2xl:!text-lg" handleClick={() => { setCurrentSection(CitizensSections.Collection) }} />
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
    </MobileLayout>
  )
}