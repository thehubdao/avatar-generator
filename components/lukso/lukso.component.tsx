import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

// Layout
import MobileLayout from '../../layouts/mobile.layout'

// Components
import {
    ChangeFeature,
    ChangeSkinColor,
    ChangeStartAnimation,
    GetAvatarGLB,
    GetAvatarVRM,
    RemoveStage,
    SetFeaturesData,
    SetStage,
} from '../avatar/editor.component'
import {
    AGChangeCamPosition,
    AGChangeLookAtPosition,
    TakeCanvasPicture,
} from '../avatar/viewer.component'
import HudComponent from '../../ui/avatar/hud.ui'

// UI
import LuksoUI from '../../ui/lukso/lukso.ui'
import TransparentBoxUI from '../../ui/lukso/common/transparentBox.ui'

// Enums
import { Client } from '../../enums/client.enum'
import { Module } from '../../enums/common.enum'
import { LuksoSections } from '../../enums/lukso/common.enum'

// Utils
import { FilterList, LogError, MixArrays } from '../../utils/common.util'
import {
    GetAccessoryListByCampaign,
    GetAnimationByCampaignAndName,
    GetAssetsListByCampaign,
    GetAvatarSingleByCampaignCombination,
    GetAvatarSingleByCampaignCombinationString,
    GetStageListByCampaign,
} from '../../utils/api.util'
import { fadeInOutBlock } from '../../utils/gsap/block_in_out.util'
import { IFrameExportData } from '../../utils/iframe.util'
import { SaveFile } from '../../utils/exporter.util'

// Interfaces
import {
    FeatureInterface,
    IndexFeatureInterface,
    SingleInterface,
    StageInterface,
} from '../../interfaces/api.interface'
import {
    BasicData,
    CampaignParameters,
    ExportInterface,
    FeatureBasic,
    LookAtVectors,
} from '../../interfaces/common.interface'
import { uploadMetadata } from '../../utils/metadata.util'
import { TokenMetadata } from '../../types/metadata.type'
import { BodyPart } from '../../types/avatar.type'
import {
    getIPFSData,
    getTokensMetadata,
    mint,
} from '../../utils/web3/lukso.util'
import { ethers } from 'ethers'
import ConnectWeb3Button from '../web3/connectWeb3.component'
import AccountModalUI from '../../ui/lukso/common/accountModal'
import Loader from '../../ui/lukso/common/loader.ui'
import { useConnectWallet } from '@web3-onboard/react'
import AvatarBuilder from '../avatar/builder.component'
import { UpdateAvatarStatus } from '../../utils/firebase.util'

const exportData: ExportInterface = { attributes: [] }
let optionList: FeatureInterface[] | undefined
let featureList: FeatureInterface[] | undefined
let accessoryList: FeatureInterface[] | undefined
let stageList: StageInterface[] | undefined
let singleInitData: SingleInterface | undefined
let loaderDivElement: HTMLDivElement
const isOnIFrame = false

const tokenMetadata: TokenMetadata = {
    name: '',
    description: '',
    GLBUrl: '',
    body: {},
    links: [], assets: [],
}

export default function LuksoComponent({
    campaignParams,
}: {
    campaignParams?: CampaignParameters
}) {
    const selectListFeatures = useRef<FeatureBasic[]>(
        campaignParams?.features ?? []
    )
    const selectListAccessories = useRef<FeatureBasic[]>(
        campaignParams?.accessories ?? []
    )
    const [singleData, setSingleData] = useState<SingleInterface | undefined>()

    // Loading flags
    const [currentSection, setCurrentSection] = useState<LuksoSections>(
        LuksoSections.Loading
    )
    const [isLoading, setIsLoading] = useState<boolean>(true)

    // Edit state
    const [optionListShow, setOptionListShow] = useState<FeatureInterface[]>()
    const [isEditModeSelected, setIsEditModeSelected] = useState<boolean>(false)
    const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(
        exportData.attributes
    )
    const [skinColor, setSkinColor] = useState<string>(
        campaignParams?.config.skin?.defColor ?? 'FFFFFF'
    )
    const [selectedCategory, setSelectedCategory] = useState<string>(
        selectListFeatures.current[0].displayName ?? ''
    )

    // Web3 state
    const [provider, setProvider] = useState<ethers.BrowserProvider>()
    const [hasMinted, setHasMinted] = useState<boolean>(false)
    const [addressToShow, setAddressToShow] = useState<string>('')
    const [
        isGettingInfoAboutHasMinted,

    ] = useState<boolean>(false)

    const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false)
    const [isLoadingMintedData, setIsLoadingMintedData] = useState<boolean>(
        false
    )
    const [{ wallet }] = useConnectWallet()

    const [picture, setPicture] = useState<string>('/resources/images/campaings/full-avatar-lukso.png');

    useEffect(() => {
        if (!wallet) return setProvider(undefined)
        const setEtherProviderPromise = () => {
            const _etherProvider = new ethers.BrowserProvider(wallet.provider, 'any')
            setProvider(_etherProvider)
        }
        void setEtherProviderPromise()
    }, [wallet])


    useEffect(() => {
        if (!provider) return
        const setTokensMetadataPromise = async () => {
            if (!wallet) return
            const address = wallet.accounts[0].address
            setAddressToShow(address)

            await setTokensMetadata(address)
        }
        void setTokensMetadataPromise()
    }, [provider])

    useEffect(() => {
        if (!hasMinted) return
        void onAvatarBuilderReady()
    }, [hasMinted])

    useEffect(() => {
        void onAvatarBuilderReady()
    }, [])

    async function onAvatarBuilderReady() {
        setIsLoadingMintedData(true)

        await Promise.all([
            getFeatureList(),
            getAccessoryList(),
            getStageList(),
            getSingleInfo(),
            !hasMinted && getSingleData(),
        ])

        optionList = MixArrays(optionList, accessoryList)

        await SetFeaturesData(campaignParams?.features ?? [])

        // Set features from single
        await loadSingleData()

        // Set skin tone
        await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'ffffff')

        // Set animation
        const result = await GetAnimationByCampaignAndName(
            Client.Lukso,
            campaignParams?.config.defAnimation
        )
        if (result.success) {
            await ChangeStartAnimation(result.value.at(0)?.path)
        }

        // fade loader view
        await handleFadeLoader(loaderDivElement, () => {
            setIsLoading(false)
            !hasMinted && setCurrentSection(LuksoSections.Main)
        })

        setIsLoadingMintedData(false)
    }

    // async function sleep(ms: number) {
    //   return new Promise(resolve => setTimeout(resolve, ms));
    // }

    async function getFeatureList() {
        const result = await GetAssetsListByCampaign(Client.Lukso)
        featureList = result.success ? result.value : undefined
        optionList = MixArrays(optionList, featureList)
        setOptionListShow(FilterList(featureList, 'type', selectedCategory))
    }

    async function getAccessoryList() {
        const result = await GetAccessoryListByCampaign(Client.Lukso)
        accessoryList = result.success ? result.value : undefined
    }

    async function getStageList() {
        const result = await GetStageListByCampaign(Client.Lukso)
        stageList = result.success ? result.value : undefined
    }

    async function getSingleInfo() {
        if (campaignParams?.config.defAvatarCombination == undefined) return

        const result = await GetAvatarSingleByCampaignCombination(
            Client.Lukso,
            campaignParams.config.defAvatarCombination
        )
        setSingleData(result.success ? result.value : undefined);
        singleInitData = result.success ? result.value : undefined
    }

    async function getSingleData() {
        const numResult = await GetAvatarSingleByCampaignCombinationString(
            Client.Lukso
        )
        const result: SingleInterface | undefined = numResult.success
            ? numResult.value
            : undefined
        singleInitData = result
        setSingleData(singleInitData);
        if(!numResult.success) return 
        let combinationId = ''
        for (const feature of numResult.value.features) {
            const { val } = feature
            const bodyIndex: keyof typeof tokenMetadata.body = val.type.toLowerCase() as keyof typeof tokenMetadata.body
            tokenMetadata.body[bodyIndex] = val as BodyPart
            combinationId += val.index.toString() + '-'
        }
        combinationId = combinationId.slice(0, combinationId.length - 1)
        await UpdateAvatarStatus(combinationId, "Minted")
        async function downloadGLB() {
            const modelPromise = await GetAvatarGLB()
            if (modelPromise.success)
                await SaveFile(modelPromise.value,`${combinationId}.glb`);
            
        }
        void downloadGLB()

    }

    async function loadSingleData() {
        // Iterate the features
        // Place the features on the model
        if (singleInitData === undefined)
            return void LogError(Module.Lukso, 'Missing single data!!!!!')

        for (const {
            val: { id, path, type, name },
        } of singleInitData.features) {
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

    async function reRoll() {
        await getSingleData()
        await loadSingleData()
        await reRoll()

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
        await ChangeFeature(
            id,
            path,
            name,
            _selectedCategory,
            skinColor,
            campaignParams?.config.skin?.materialName,
            campaignParams?.config.changeMaterial
        )

        addReplaceAttribute(_selectedCategory, name)
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
        const [picturePromise, VRMPromise, modelPromise] = await Promise.all([
            TakeCanvasPicture(''),
            GetAvatarVRM(),
            GetAvatarGLB(),
        ])
        exportData.picture = picturePromise
        exportData.model = modelPromise.success ? modelPromise.value : undefined;

        if (isOnIFrame) {
            IFrameExportData(exportData)
        } else {
            if (VRMPromise.success) await SaveFile(VRMPromise.value, 'model.vrm')
            if (exportData.model != undefined)
                await SaveFile(exportData.model, 'model.glb')
            await SaveFile(exportData.picture, 'picture.png')

        }
    }

    async function setTokensMetadata(address: string) {
        const tokensMetadata = await getTokensMetadata(address)
        if (tokensMetadata.length <= 0) {
            return setHasMinted(false)
        }
        const avatarMetadata = await getIPFSData(tokensMetadata[0])
        const { LSP4Metadata } = avatarMetadata
        const features = Object.entries(LSP4Metadata.body).map(
            ([key, bodyPart]: Array<string | BodyPart>) => {
                return {
                    index: Number(key),
                    val: bodyPart,
                } as IndexFeatureInterface
            }
        )
        setSingleData({ random: false, features });
        setHasMinted(true)
    }

    async function handleClaim(address: string) {
        if (!singleData)
            return {
                message: 'Error claiming citizen, please try again later!',
                success: false,
            }
        const { features } = singleData
        
        let combinationId = ''
        try {
            for (const feature of features) {
                const { val } = feature
                const bodyIndex: keyof typeof tokenMetadata.body = val.type.toLowerCase() as keyof typeof tokenMetadata.body
                tokenMetadata.body[bodyIndex] = val as BodyPart
                combinationId += val.index.toString() + '-'
            }
            combinationId = combinationId.slice(0, combinationId.length - 1)
            const metadataUrl = await uploadMetadata(tokenMetadata)


            await mint(address, metadataUrl, combinationId)
            await setTokensMetadata(address)

            return { message: 'Your citizen has been created!', success: true }
        } catch (error) {
            return {
                message:
                    "Looks like you've already claimed your avatar! Remember, each explorer gets just one.",
                success: false,
            }
        }
    }

    function formatearString(inputString: string): string {
        if (inputString.length < 8) {
            return 'El string debe tener al menos 8 caracteres'
        }

        const primerosCuatro = inputString.slice(0, 4)
        const ultimosCuatro = inputString.slice(-4)

        return `(${primerosCuatro}...${ultimosCuatro})`
    }

    return (
        <MobileLayout>
            <div className="w-full h-screen bg-[#FFCBDE] flex flex-col">
                {isAccountModalOpen && (
                    <AccountModalUI
                        addressAccount={addressToShow}
                        formatAddress={formatearString(addressToShow)}
                        setIsAccountModalOpen={(value) =>
                            setIsAccountModalOpen(value)
                        }
                        onDisconnect={() => { setCurrentSection(LuksoSections.Main) }}
                    />
                )}
                <div className='z-10'>
                    <TransparentBoxUI
                        fullWidth
                        border
                        backgroundColorClass="bg-[#FFCBDE]"
                        opacityPercentage="50"
                        borderColorClass="border-white"
                        borderSizeClass="border-2"
                        heightClass="h-14"
                        paddingClass="pl-11"
                        alignItemsClass="items-stretch"
                    >
                        <div className="flex flex-row justify-between h-full">
                            <Image
                                src="/resources/icons/campaigns/lukso.svg"
                                width={106}
                                height={24}
                                alt="Lukso icon"
                            />

                            {provider ? (
                                <button
                                    className="h-full w-48 flex justify-center items-center border-l-2 border-white px-2"
                                    onClick={() => setIsAccountModalOpen(true)}
                                >
                                    <p className="truncate h-fit text-white">{`${formatearString(
                                        addressToShow
                                    )}`}</p>
                                </button>
                            ) : (
                                <ConnectWeb3Button
                                    classStyles={
                                        'w-48 border-l-2 border-white font-bold text-white'
                                    }
                                    onConnect={() => { }}

                                >
                                    <>Login with your UP!</>
                                </ConnectWeb3Button>
                            )}
                        </div>
                    </TransparentBoxUI>
                </div>
                {/* CANVAS WRAPPER */}
                <div className="fixed left-[50%] translate-x-[-50%] flex justify-center xl:justify-end items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
                    {/* CANVAS BACKGROUND */}
                    <div className="w-full h-screen absolute opacity-0" />
                    {/* CANVAS */}
                    {/* {campaignParams && (
                        <AvatarEditor
                            avatarBasePath={campaignParams.armature}
                            editMode={isEditModeSelected}
                            lights={campaignParams.config.lights}
                            defaultShadow={campaignParams.config.defShadow}
                            defaultCamera={campaignParams.config.defCam}
                            onReady={() => onAvatarBuilderReady()}
                        />
                    )} */}
                    {campaignParams && (
                        <AvatarBuilder
                            avatarBasePath={campaignParams.armature}
                            campaign='lukso female b'
                            campaignConfig={campaignParams.config}
                            onlyView
                            selectListAccessories={selectListAccessories.current}
                            selectListFeatures={selectListFeatures.current}
                            bgColor='FABCE2'
                        />
                    )}
                </div>
                <div
                    className={`fixed h-screen w-full flex justify-center items-center bg-[#FFCBDE] top-14 duration-100 transition-all ${isLoadingMintedData ? 'flex' : 'hidden'
                        }`}
                >
                    <div className="scale-[3]">
                        <Loader />
                    </div>
                </div>
                <div className="fixed z-10">
                    <HudComponent
                        selectedOption={selectedOpc.find(
                            (e) => e.id === selectedCategory
                        )}
                        editModeSelected={isEditModeSelected}
                        selectListCategory={[
                            ...selectListFeatures.current,
                            ...selectListAccessories.current,
                        ]}
                        // optionList
                        optionList={optionListShow}
                        // selectedCategory
                        selectedCategory={selectedCategory}
                        campaignSkinColorConfig={
                            campaignParams?.config.skin || {}
                        }
                        skinColor={skinColor}
                        changeView={() => {
                            setIsEditModeSelected(!isEditModeSelected)
                            void updateStage(!isEditModeSelected)
                        }}
                        // changeCategory
                        onOptionChange={(id, path, name) =>
                            void onOptionChange(id, path, name)
                        }
                        // onCategoryChange
                        onCategoryTypeChange={(value) =>
                            onCategoryTypeChange(value)
                        }
                        onSkinColorChange={(value) =>
                            void onClickChangeSkinColor(value)
                        }
                        exportModel={() => exportModel()}
                        isCustomCampaignHud
                    />
                </div>
                <LuksoUI
                    reRoll={reRoll}
                    setIsEditModeSelected={(value) =>
                        setIsEditModeSelected(value)
                    }
                    isLoading={isLoading}
                    currentSection={currentSection}
                    setCurrentSection={(changeSectionValue) =>
                        setCurrentSection(changeSectionValue)
                    }
                    getloaderDivElement={(elementReference) =>
                        getloaderDivElement(elementReference)
                    }
                    exportModel={() => exportModel()}
                    handleClaim={handleClaim}
                    hasMinted={hasMinted}
                    provider={provider}
                    isGettingInfoAboutHasMinted={isGettingInfoAboutHasMinted}
                    features={singleData?.features}
                    setPicture={(picture: string) => setPicture(picture)}
                    picture={picture}
                />
            </div>
        </MobileLayout>
    )
}
