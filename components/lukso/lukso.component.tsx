import { useRef, useState } from "react";
import Image from "next/image";

// Layout
import MobileLayout from "../../layouts/mobile.layout";

// Components
import AvatarEditor, { ChangeFeature, ChangeSkinColor, ChangeStartAnimation, GetAvatarGLB, GetAvatarVRM, RemoveStage, SetFeaturesData, SetStage } from "../avatar/editor.component";
import { AGChangeCamPosition, AGChangeLookAtPosition, TakeCanvasPicture } from "../avatar/viewer.component";
import HudUI from "../../ui/avatar/hud.ui";

// UI
import LuksoUI from "../../ui/lukso/lukso.ui";
import TransparentBoxUI from "../../ui/lukso/common/transparentBox.ui";

// Enums
import { Module } from "../../enums/common.enum";
import { LuksoSections } from "../../enums/lukso/common.enum";

// Utils
import { FilterList, LogError, MixArrays } from "../../utils/common.util";
import { GetAccessoryListByCampaign, GetAnimationByCampaignAndName, GetAssetsListByCampaign, GetAvatarSingleByCampaignCombination, GetStageListByCampaign } from "../../utils/api.util";
import { fadeInOutBlock } from "../../utils/gsap/block_in_out.util";
import { IFrameExportData } from "../../utils/iframe.util";
import { SaveFile } from "../../utils/exporter.util";

// Interfaces
import { FeatureInterface, SingleInterface, StageInterface } from "../../interfaces/api.interface";
import { BasicData, CampaignParameters, ExportInterface, FeatureBasic, LookAtVectors } from "../../interfaces/common.interface";

const exportData: ExportInterface = { attributes: [] };
let optionList: FeatureInterface[] | undefined;
let featureList: FeatureInterface[] | undefined;
let accessoryList: FeatureInterface[] | undefined;
let stageList: StageInterface[] | undefined;
let singleData: SingleInterface | undefined;
let loaderDivElement: HTMLDivElement;
const isOnIFrame = false;

interface LuksoComponentProps {
  clientLukso: string;
  campaignParams?: CampaignParameters;
}

export default function LuksoComponent({ campaignParams, clientLukso }: LuksoComponentProps) {
  const selectListFeatures = useRef<FeatureBasic[]>(campaignParams?.features ?? []);
  const selectListAccessories = useRef<FeatureBasic[]>(campaignParams?.accessories ?? []);

  // Loading flags
  const [currentSection, setCurrentSection] = useState<LuksoSections>(LuksoSections.Loading);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Edit state
  const [optionListShow, setOptionListShow] = useState<FeatureInterface[]>();
  const [isEditModeSelected, setIsEditModeSelected] = useState<boolean>(false);
  const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(exportData.attributes);
  const [skinColor, setSkinColor] = useState<string>(campaignParams?.config.skin?.defColor ?? 'FFFFFF');
  const [selectedCategory, setSelectedCategory] = useState<string>(selectListFeatures.current.at(0)?.displayName ?? '');

  async function onAvatarBuilderReady() {
    await Promise.all([
      getFeatureList(),
      getAccessoryList(),
      getStageList(),
      getSingleInfo(),
      getSingleData(),
      sleep(5000)
    ]);

    optionList = MixArrays(optionList, accessoryList);

    await SetFeaturesData(campaignParams?.features ?? []);

    // Set features from single
    await loadSingleData();

    // Set skin tone
    await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'ffffff');

    // Set animation
    const result = await GetAnimationByCampaignAndName(clientLukso, campaignParams?.config.defAnimation);
    if (result.success) {
      await ChangeStartAnimation(result.value.at(0)?.path);
    }

    // fade loader view
    await handleFadeLoader(loaderDivElement, () => {
      setIsLoading(false);
      setCurrentSection(LuksoSections.Main);
    })
  }

  async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getFeatureList() {
    const result = await GetAssetsListByCampaign(clientLukso);
    featureList = result.success ? result.value : undefined;
    optionList = MixArrays(optionList, featureList);
    setOptionListShow(FilterList(featureList, "type", selectedCategory));
  }

  async function getAccessoryList() {
    const result = await GetAccessoryListByCampaign(clientLukso);
    accessoryList = result.success ? result.value : undefined;
  }

  async function getStageList() {
    const result = await GetStageListByCampaign(clientLukso);
    stageList = result.success ? result.value : undefined;
  }

  async function getSingleInfo() {
    if (campaignParams?.config.defAvatarCombination == undefined) return;

    const result = await GetAvatarSingleByCampaignCombination(clientLukso, campaignParams.config.defAvatarCombination);
    singleData = result.success ? result.value : undefined;
  }

  async function getSingleData() {
    const numResult = await GetAvatarSingleByCampaignCombination(clientLukso);
    const result: SingleInterface | undefined = numResult.success ? numResult.value : undefined;
    singleData = result;
  }

  async function loadSingleData() {
    // Iterate the features
    // Place the features on the model
    if (singleData == undefined)
      return void LogError(Module.Lukso, "Missing single data!");

    for (const { val: { id, path, type, name } } of singleData.features) {
      // Set feature on model
      await ChangeFeature(id, path, name, type, campaignParams?.config.skin?.defColor ?? 'ffffff');
    }
  }

  async function reRoll() {
    await getSingleData();
    await loadSingleData();
  }

  async function updateStage(isEditMode: boolean) {
    if (isEditMode) {
      RemoveStage();
    }
    else {
      const defStage = stageList?.find(stg => stg.name == campaignParams?.config.defStage);
      await SetStage(defStage?.path);
    }
  }

  async function onOptionChange(id: string, path: string, name: string, _selectedCategory: string = selectedCategory) {
    await ChangeFeature(id, path, name, _selectedCategory, skinColor, campaignParams?.config.skin?.materialName, campaignParams?.config.changeMaterial);

    addReplaceAttribute(_selectedCategory, name);
  }

  function addReplaceAttribute(addId: string, addValue: string) {
    if (exportData && exportData.attributes.some(x => x.id === addId)) {
      const oldAttribute = exportData.attributes.find(x => x.id === addId);
      if (oldAttribute)
        oldAttribute.val = addValue;

      setSelectedOpc([...exportData.attributes]);
      return;
    }

    exportData?.attributes.push({ id: addId, val: addValue });
    setSelectedOpc([...exportData.attributes]);
  }

  function onCategoryTypeChange(value: string) {
    setSelectedCategory(value);
    setOptionListShow(FilterList(optionList, "type", value));
    updateFeatureCamPosition(value, { ...campaignParams?.config.featuresCamPos, ...campaignParams?.config.accCamPos });
  }

  function updateFeatureCamPosition(index: string, posLocation?: Record<string, LookAtVectors>) {
    const confRef = posLocation ? posLocation[index] : undefined;
    if (confRef == undefined) return;

    AGChangeCamPosition(confRef.pos);
    AGChangeLookAtPosition(confRef.lookAt);
  }

  async function onClickChangeSkinColor(newSkinColor = skinColor) {
    await ChangeSkinColor(newSkinColor, campaignParams?.config.skin?.materialName);
    setSkinColor(newSkinColor);
  }

  async function handleFadeLoader(elementReference: HTMLDivElement, thenFunction?: () => void) {
    await fadeInOutBlock(elementReference, 1, true, thenFunction);
  }

  function getloaderDivElement(elementReference: HTMLDivElement) {
    loaderDivElement = elementReference;
  }

  async function exportModel() {
    exportData.attributesBase64 = window.btoa(JSON.stringify(exportData.attributes));
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
  }}

  return (
    <MobileLayout>
      <div className="w-full h-screen bg-[#FABCE2] flex flex-col">
        <TransparentBoxUI
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          opacityPercentage="50"
          borderColorClass="border-white"
          borderSizeClass="border-2"
          heightClass="h-14"
          paddingClass="px-11"
          alignItemsClass="items-stretch"
        >
          <Image
            src='/resources/icons/campaigns/lukso.svg'
            width={106}
            height={24}
            alt="Lukso icon"
          />
        </TransparentBoxUI>
        {/* CANVAS WRAPPER */}
        <div
          className="fixed left-[50%] translate-x-[-50%] flex justify-center xl:justify-end items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
          {/* CANVAS BACKGROUND */}
          <div className="w-full h-screen absolute bg-opacity-0" />
          {/* CANVAS */}
          {campaignParams && <AvatarEditor
            avatarBasePath={campaignParams.armature}
            editMode={isEditModeSelected}
            onReady={() => onAvatarBuilderReady()}
          />}
        </div>
        <div className="fixed z-10">
          <HudUI
            selectedOption={selectedOpc.find(e => e.id === selectedCategory)}

            editModeSelected={isEditModeSelected}

            selectListCategory={[...selectListFeatures.current, ...selectListAccessories.current]}

            // optionList
            optionList={optionListShow}

            // selectedCategory
            selectedCategory={selectedCategory}

            campaignSkinColorConfig={campaignParams?.config.skin || {}}
            skinColor={skinColor}

            changeView={() => {
              setIsEditModeSelected(!isEditModeSelected);
              void updateStage(!isEditModeSelected);
            }}

            // changeCategory
            onOptionChange={(id, path, name) => void onOptionChange(id, path, name)}

            // onCategoryChange
            onCategoryTypeChange={(value) => onCategoryTypeChange(value)}
            onSkinColorChange={(value) => void onClickChangeSkinColor(value)}
            exportModel={() => exportModel()}

            isCustomCampaignHud
          />
        </div>
        <LuksoUI
          reRoll={reRoll}
          setIsEditModeSelected={(value) => setIsEditModeSelected(value)}
          isLoading={isLoading}
          currentSection={currentSection}
          setCurrentSection={(changeSectionValue) => setCurrentSection(changeSectionValue)}
          getloaderDivElement={(elementReference) => getloaderDivElement(elementReference)}
          exportModel={() => exportModel()}
        />
      </div>
    </MobileLayout>
  )
}