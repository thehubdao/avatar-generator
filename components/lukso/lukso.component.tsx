import { useRef, useState } from "react";
import Image from "next/image";

import LuksoUI from "../../ui/lukso/lukso.ui";
import { Client } from "../../enums/client.enum";
import MobileLayout from "../../layouts/mobile.layout";
import HudComponent from "../../ui/avatar/hud.component";
import TransparentBox from "../../ui/common/transparentBox.ui";
import { GlobalValues, Module } from "../../enums/common.enum";
import { FilterList, LogError, MixArrays } from "../../utils/common.util";
import { AGChangeCamPosition, AGChangeLookAtPosition } from "../avatar/viewer.component";
import { AnimationInterface, EnvMapInterface, FeatureInterface, SingleInterface, StageInterface } from "../../interfaces/api.interface";
import { GetAccessoryListByCampaign, GetAnimationByCampaignAndName, GetAnimationListByCampaign, GetAssetsListByCampaign, GetAvatarSingleByCampaignCombination, GetEnvMapListByCampaign, GetStageListByCampaign } from "../../utils/api.util";
import { BasicData, CampaignParameters, ExportInterface, FeatureBasic, LookAtVectors } from "../../interfaces/common.interface";
import AvatarEditor, { ChangeAccessory, ChangeFeature, ChangeSkinColor, ChangeStartAnimation, RemoveStage, SetFeaturesData, SetStage } from "../avatar/editor.component";

const exportData: ExportInterface = { attributes: [] };
let optionList: FeatureInterface[] | undefined;
let featureList: FeatureInterface[] | undefined;
let accessoryList: FeatureInterface[] | undefined;
let animationList: AnimationInterface[] | undefined;
let stageList: StageInterface[] | undefined;
let envMapList: EnvMapInterface[] | undefined;
let singleData: SingleInterface | undefined;

export default function LuksoComponent({ campaignParams }: { campaignParams?: CampaignParameters }) {
  const selectListFeatures = useRef<FeatureBasic[]>(campaignParams?.features ?? []);
  const selectListAccessories = useRef<FeatureBasic[]>(campaignParams?.accessories ?? []);

  const [optionListShow, setOptionListShow] = useState<FeatureInterface[]>();
  const [isEditModeSelected, setIsEditModeSelected] = useState<boolean>(false);
  const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(exportData.attributes);
  const [skinColor, setSkinColor] = useState<string>(campaignParams?.config.skin?.defColor ?? 'FFFFFF');
  const [selectedCategory, setSelectedCategory] = useState<string>(selectListFeatures.current[0].displayName ?? '');

  async function onAvatarBuilderReady() {
    await Promise.all([
      getFeatureList(),
      getAccessoryList(),
      getAnimationList(),
      getStageList(),
      getEnvironmentMapList(),
      getSingleInfo(),
      getSingleData()
    ]);

    optionList = MixArrays(optionList, accessoryList);

    await SetFeaturesData(campaignParams?.features ?? []);

    // Set features from single
    await loadSingleData();

    // Set skin tone
    await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'ffffff');

    // Set animation
    const result = await GetAnimationByCampaignAndName(Client.Lukso, campaignParams?.config.defAnimation);
    if (result.success) {
      await ChangeStartAnimation(result.value.at(0)?.path);
    }
  }

  async function getFeatureList() {
    const result = await GetAssetsListByCampaign(Client.Lukso);
    featureList = result.success ? result.value : undefined;
    optionList = MixArrays(optionList, featureList);
    // setFeatureListShow(FilterList(featureList, "type", selectedFeature));
    setOptionListShow(FilterList(featureList, "type", selectedCategory));
  }

  async function getAccessoryList() {
    const result = await GetAccessoryListByCampaign(Client.Lukso);
    accessoryList = result.success ? result.value : undefined;
    // setAccessoryListShow(FilterList(accessoryList, "type", selectedAcc));
  }

  async function getAnimationList() {
    const result = await GetAnimationListByCampaign(Client.Lukso);
    animationList = result.success ? result.value : undefined;
  }

  async function getStageList() {
    const result = await GetStageListByCampaign(Client.Lukso);
    stageList = result.success ? result.value : undefined;
  }

  async function getEnvironmentMapList() {
    const result = await GetEnvMapListByCampaign(Client.Lukso);
    envMapList = result.success ? result.value : undefined;
  }

  async function getSingleInfo() {
    if (campaignParams?.config.defAvatarCombination == undefined) return;

    const result = await GetAvatarSingleByCampaignCombination(Client.Lukso, campaignParams.config.defAvatarCombination);
    singleData = result.success ? result.value : undefined;
  }

  async function getSingleData() {
    let result: SingleInterface | undefined;
    const numResult = await GetAvatarSingleByCampaignCombination(Client.Lukso);
    result = numResult.success ? numResult.value : undefined;
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
    // If Accessory
    if (_selectedCategory.endsWith(GlobalValues.AccEnd))
      await ChangeAccessory(id, path, name, _selectedCategory, campaignParams?.config.changeMaterial);
    // If Feature
    else
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

  return (
    <MobileLayout>
      <div className="w-full h-screen bg-[#FABCE2] flex flex-col">
        <TransparentBox
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
        </TransparentBox>
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
          <HudComponent
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
            onOptionChange={(id: string, path: string, name: string) => void onOptionChange(id, path, name)}

            // onCategoryChange
            onCategoryTypeChange={(value: string) => onCategoryTypeChange(value)}
            onSkinColorChange={(value: string) => void onClickChangeSkinColor(value)}
            exportModel={() => { }}

            isCustomCampaignHud
          />
        </div>
        <LuksoUI reRoll={reRoll} setIsEditModeSelected={setIsEditModeSelected} />
      </div>
    </MobileLayout>
  )
}