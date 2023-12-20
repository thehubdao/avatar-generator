import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import {
  BasicData,
  FeatureBasic,
  CampaignConfig,
  ExportInterface,
  LookAtVectors
} from "../../interfaces/common.interface";
import {
  AccessoryInterface,
  AnimationInterface,
  StageInterface,
  FeatureInterface,
  SingleInterface,
  EnvMapInterface
} from "../../interfaces/api.interface";
import { IFrameExportData, IFrameReady, SetIFrameEvents } from "../../utils/iframe.util";
import { Module } from "../../enums/common.enum";
import { FilterList, LogError, RandomArrayElement, MixArrays } from "../../utils/common.util";
import {
  GetAccessoryListByCampaign,
  GetAnimationListByCampaign,
  GetAssetsListByCampaign, GetAvatarCombinationByAttributes,
  GetAvatarSingleByCampaignCombination,
  GetEnvMapListByCampaign,
  GetStageListByCampaign
} from "../../utils/api.util";
import { SaveFile } from "../../utils/exporter.util";
import AGLoading from "../../ui/common/ag-loading.component";
import HudUI from "../../ui/avatar/hud.ui";
import AvatarEditor, {
  ChangeAccessory,
  ChangeFeature, ChangeSkinColor,
  ChangeStartAnimation,
  GetAvatarGLB,
  GetAvatarVRM,
  GetWearableOption,
  RemoveStage,
  SetStage,
  SetFeaturesData,
  SetEnvironment
} from "./editor.component";
import { AGChangeCamPosition, AGChangeLookAtPosition, TakeCanvasPicture } from "./viewer.component";
import {Result} from "../../types/common.type";
import {EXPORT_ATTRIBUTE, GLOBAL_VALUES} from "../../constants/common.constant";
import {GenerateVrmMetaData} from "../../utils/threejs/vrm.util";
import { ModelExtension } from "../../enums/export.enum";

interface AvatarBuilderProps {
  campaign: string;
  avatarBasePath: string;
  campaignConfig: CampaignConfig;
  selectListFeatures: FeatureBasic[];
  selectListAccessories: FeatureBasic[];
  attributeConfig?: BasicData[];
  bgColor?: string;
  onlyView: boolean;
  enablePan?: boolean;
}

let optionList: FeatureInterface[] | undefined;
let featureList: FeatureInterface[] | undefined;
let accessoryList: FeatureInterface[] | undefined;
let animationList: AnimationInterface[] | undefined;
let stageList: StageInterface[] | undefined;
let envMapList: EnvMapInterface[] | undefined;
let singleData: SingleInterface | undefined;

const exportData: ExportInterface = { attributes: [] };
let isOnIFrame = false;

/***
 * Component with all the main logic used on the AvatarBuilder app.
 * @constructor
 */
export default function AvatarBuilder({
  selectListFeatures,
  selectListAccessories,
  onlyView,
  campaign,
  attributeConfig,
  avatarBasePath,
  campaignConfig,
  bgColor,
  enablePan
}: AvatarBuilderProps) {
  const [selectedFeature/* , setSelectedFeature */] = useState<string>(selectListFeatures.length > 0 ? selectListFeatures[0].displayName : '');
  const [selectedAcc/* , setSelectedAcc */] = useState<string>(selectListAccessories.length > 0 ? selectListAccessories[0].displayName : '');
  const [selectedCategory, setSelectedCategory] = useState<string>(selectListFeatures.length > 0 ? selectListFeatures[0].displayName : '');
  const [skinColor, setSkinColor] = useState<string>(campaignConfig.skin?.defColor ?? 'FFFFFF');
  const [isEditModeSelected, setIsEditModeSelected] = useState<boolean>(false);
  // const [featuresSelected, setFeaturesSelected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [featureListShow, setFeatureListShow] = useState<FeatureInterface[]>();
  // const [accessoryListShow, setAccessoryListShow] = useState<FeatureInterface[]>();
  const [optionListShow, setOptionListShow] = useState<FeatureInterface[]>();
  const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(exportData.attributes);

  const startPromises = useRef<Promise<unknown>>();

  useEffect(() => {
    startPromises.current = Promise.all([
      getFeatureList(),
      getAccessoryList(),
      getAnimationList(),
      getStageList(),
      getEnvironmentMapList(),
      getSingleInfo()
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAvatarBuilderReady() {
    await startPromises.current;
    optionList = MixArrays(optionList, accessoryList);
    await SetFeaturesData(selectListFeatures);

    await loadPreData();

    const bgMap = envMapList?.find(em => em.name === campaignConfig.envMap?.defBgMap);
    const lightMap = envMapList?.find(em => em.name === campaignConfig.envMap?.defLightMap);
    await SetEnvironment(bgMap?.path, lightMap?.path, campaignConfig.envMap?.skyboxConfig)

    await onClickChangeSkinColor();

    const startAnimation = animationList?.find(a => a.name == campaignConfig.defAnimation) ?? animationList?.at(0);
    await ChangeStartAnimation(startAnimation?.path);

    setIsLoading(false);

    IFrameReady(setOnIFrame);
  }

  const setOnIFrame = () => {
    isOnIFrame = true;
    SetIFrameEvents(changeFeatureFromIFrame, exportFromIFrame, changeSkinColorFromIFrame);
  }

  async function changeFeatureFromIFrame(params?: BasicData) {
    if (!isOnIFrame) return LogError(Module.AvatarGenerator, "Not on IFrame, subscribe if you forgot!");
    if (!params) return LogError(Module.AvatarGenerator, "Missing feature option!");

    if (params.detail?.startsWith('http')) {
      if (params.id.endsWith(GLOBAL_VALUES.AccEnd)) {
        await ChangeAccessory(`${params.id}_${params.val}_${params.detail}`, params.detail, params.val, params.id, campaignConfig.changeMaterial);
      } else {
        await onChangeFeature(`${params.id}_${params.val}_${params.detail}`, params.detail, params.val, params.id);
      }
    } else {
      if (params.id.endsWith(GLOBAL_VALUES.AccEnd)) {
        const accessory = accessoryList?.find(a => a.type === params.id && a.name === params.val);

        if (!accessory) return LogError(Module.AvatarGenerator, "Accessory option not found!");
        await ChangeAccessory(accessory.id, accessory.path, accessory.name, accessory.type, campaignConfig.changeMaterial);
      } else {
        const feature = featureList?.find(p => p.type === params.id && p.name === params.val);

        if (!feature) return LogError(Module.AvatarGenerator, "Feature option not found!");
        await onChangeFeature(feature.id, feature.path, feature.name, feature.type);
      }
    }
  }

  const changeSkinColorFromIFrame = (newColor?: string) => {
    return onClickChangeSkinColor(newColor);
  }

  const exportFromIFrame = () => {
    return exportModel(ModelExtension.GLB);
  }

  async function loadPreData() {
    if (campaignConfig.defAvatarCombination != undefined && singleData != undefined) {
      await updateAvatarSingleData();
      await setRandomAccessories();
      return;
    }
    if (!(featureList && accessoryList))
      return LogError(Module.AvatarGenerator, "No feature/accessory list!");

    if (campaign) {
      exportData?.attributes.push({ id: EXPORT_ATTRIBUTE.Campaign, val: campaign });
    }

    if (attributeConfig) {
      for (const attribute of attributeConfig) {
        // Is a feature
        if (selectListFeatures.some(pl => pl.displayName === attribute.id)) {
          const newFeature = featureList.find(p => p.name === attribute.val && p.type === attribute.id);
          if (newFeature)
            await onChangeFeature(newFeature.id, newFeature.path, newFeature.name, attribute.id);
        }
        // Is an accessory
        else if (selectListAccessories.some(pl => pl.displayName === attribute.id)) {
          const newAcc = accessoryList.find(p => p.name === attribute.val && p.type === attribute.id);
          if (newAcc)
            await onChangeAccessory(newAcc.id, newAcc.path, newAcc.name, attribute.id);
        }
      }
    } else {
      const randomFeature: FeatureInterface[] = [];
      const randomAccessory: AccessoryInterface[] = [];

      // Load random features
      for (const featureType of selectListFeatures) {
        const randomFeatureOption = RandomArrayElement(featureList.filter(p => p.type === featureType.displayName));
        if (randomFeatureOption)
          randomFeature.push(randomFeatureOption);
      }

      for (const accType of selectListAccessories) {
        const randomAcc = RandomArrayElement(accessoryList.filter(a => a.type === accType.displayName));
        if (randomAcc)
          randomAccessory.push(randomAcc);
      }

      const modelPromises: Promise<Result<GLTF>>[] = [];
      for (const feature of randomFeature)
        modelPromises.push(GetWearableOption(feature.id, feature.path));
      for (const acc of randomAccessory)
        modelPromises.push(GetWearableOption(acc.id, acc.path));
      await Promise.all([...modelPromises]);

      for (const feature of randomFeature)
        await onChangeFeature(feature.id, feature.path, feature.name, feature.type);
      for (const acc of randomAccessory)
        await onChangeAccessory(acc.id, acc.path, acc.name, acc.type);
    }
  }

  async function setRandomAccessories() {
    if (!accessoryList)
      return LogError(Module.AvatarGenerator, "No feature/accessory list!");

    const randomAccessory: AccessoryInterface[] = [];

    for (const accType of selectListAccessories) {
      const randomAcc = RandomArrayElement(accessoryList.filter(a => a.type === accType.displayName));
      if (randomAcc)
        randomAccessory.push(randomAcc);
    }

    const modelPromises: Promise<Result<GLTF>>[] = [];
    for (const acc of randomAccessory)
      modelPromises.push(GetWearableOption(acc.id, acc.path));
    await Promise.all([...modelPromises]);

    for (const acc of randomAccessory)
      await onChangeAccessory(acc.id, acc.path, acc.name, acc.type);
  }

  async function updateAvatarSingleData() {
    if (singleData == undefined) return void LogError(Module.AvatarGenerator, "Missing single data!");

    for (const { val: { id, path, type, name } } of singleData.features) {
      // Set feature on model
      await onChangeFeature(id, path, name, type);
    }
  }

  async function getFeatureList() {
    const result = await GetAssetsListByCampaign(campaign);
    featureList = result.success ? result.value : undefined;
    optionList = MixArrays(optionList, featureList);
    // setFeatureListShow(FilterList(featureList, "type", selectedFeature));
    setOptionListShow(FilterList(featureList, "type", selectedCategory));
  }

  async function getAccessoryList() {
    const result = await GetAccessoryListByCampaign(campaign);
    accessoryList = result.success ? result.value : undefined;
    // setAccessoryListShow(FilterList(accessoryList, "type", selectedAcc));
  }

  async function getAnimationList() {
    const result = await GetAnimationListByCampaign(campaign);
    animationList = result.success ? result.value : undefined;
  }

  async function getStageList() {
    const result = await GetStageListByCampaign(campaign);
    stageList = result.success ? result.value : undefined;
  }

  async function getEnvironmentMapList() {
    const result = await GetEnvMapListByCampaign(campaign);
    envMapList = result.success ? result.value : undefined;
  }

  async function getSingleInfo() {
    if (campaignConfig.defAvatarCombination == undefined) return;

    const result = await GetAvatarSingleByCampaignCombination(campaign, campaignConfig.defAvatarCombination);
    singleData = result.success ? result.value : undefined;
  }

  async function onClickChangeSkinColor(newSkinColor = skinColor) {
    await ChangeSkinColor(newSkinColor, campaignConfig.skin?.materialName);
    setSkinColor(newSkinColor);
  }

  // function onFeatureTypeChange(value: string) {
  //   setSelectedFeature(value);
  //   setFeatureListShow(FilterList(featureList, "type", value));
  //   updateFeatureCamPosition(value, campaignConfig.featuresCamPos);
  // }

  // function onAccessoryTypeChange(value: string) {
  //   setSelectedAcc(value);
  //   setAccessoryListShow(FilterList(accessoryList, "type", value));
  //   updateFeatureCamPosition(value, campaignConfig.accCamPos);
  // }

  function onCategoryTypeChange(value: string) {
    setSelectedCategory(value);
    setOptionListShow(FilterList(optionList, "type", value));
    updateFeatureCamPosition(value, { ...campaignConfig.featuresCamPos, ...campaignConfig.accCamPos });
  }

  function updateFeatureCamPosition(index: string, posLocation?: Record<string, LookAtVectors>) {
    const confRef = posLocation ? posLocation[index] : undefined;
    if (confRef == undefined) return;

    AGChangeCamPosition(confRef.pos);
    AGChangeLookAtPosition(confRef.lookAt);
  }
  
  function updateCamMode(isEditMode: boolean) {
    if(isEditMode) {
      updateFeatureCamPosition(selectedCategory, { ...campaignConfig.featuresCamPos, ...campaignConfig.accCamPos });
    } else {
      AGChangeCamPosition(campaignConfig.defCam?.pos);
      AGChangeLookAtPosition(campaignConfig.defCam?.lookAt);
    }
  }

  async function onChangeFeature(id: string, featurePath: string, name: string, _selectedFeature: string = selectedFeature) {
    await ChangeFeature(id, featurePath, name, _selectedFeature, skinColor, campaignConfig.skin?.materialName, campaignConfig.changeMaterial);
    // TODO: find ways to avoid this
    await SetFeaturesData(selectListFeatures);
    addReplaceAttribute(_selectedFeature, name);
  }

  async function onChangeAccessory(id: string, path: string, name: string, _selectedAcc: string = selectedAcc) {
    await ChangeAccessory(id, path, name, _selectedAcc, campaignConfig.changeMaterial);
    addReplaceAttribute(selectedAcc, name);
  }

  async function onOptionChange(id: string, path: string, name: string, _selectedCategory: string = selectedCategory) {
    // If Accessory
    if (_selectedCategory.endsWith(GLOBAL_VALUES.AccEnd))
      await ChangeAccessory(id, path, name, _selectedCategory, campaignConfig.changeMaterial);
    // If Feature
    else
      await ChangeFeature(id, path, name, _selectedCategory, skinColor, campaignConfig.skin?.materialName, campaignConfig.changeMaterial);


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

  async function exportModel(type: ModelExtension) {
    // TODO: Add metadata from user
    GenerateVrmMetaData(undefined);
    
    const attributesBase64 = window.btoa(JSON.stringify(exportData.attributes));
    
    exportData.attributesBase64 = attributesBase64;
    const [picturePromise, modelPromise, combinationPromise] = await Promise.all([
      TakeCanvasPicture(),
      type === ModelExtension.VRM ? GetAvatarVRM() : GetAvatarGLB(),
      GetAvatarCombinationByAttributes(campaign, attributesBase64)
    ]);
    exportData.picture = picturePromise;
    exportData.model = modelPromise.success ? modelPromise.value : undefined;
    exportData.combination = combinationPromise.success ? combinationPromise.value : undefined;

    if (isOnIFrame) {
      IFrameExportData(exportData);
    } else {
      if (modelPromise.success)
        await SaveFile(modelPromise.value, `model.${type}`);

      await SaveFile(exportData.picture, 'picture.png');
    }
  }

  async function updateStage(isEditMode: boolean) {
    if (isEditMode) {
      RemoveStage();
    }
    else {
      const defStage = stageList?.find(stg => stg.name == campaignConfig.defStage);
      await SetStage(defStage?.path);
    }
  }

  return (
    <>
      <Head>
        <title>Avatar Generator</title>
      </Head>
      {/* LOADING */}
      <AGLoading loading={isLoading} bgColor={bgColor} />
      {/* CANVAS WRAPPER */}
      <div
        className="fixed left-[50%] translate-x-[-50%] flex justify-center xl:justify-end items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
        {/* CANVAS BACKGROUND */}
        <div style={{ backgroundColor: `#${bgColor ?? '272727'}` }} className="w-full h-screen absolute" />
        {/* CANVAS */}
        <AvatarEditor
          avatarBasePath={avatarBasePath}
          onReady={() => onAvatarBuilderReady()}
          changeMaterial={campaignConfig.changeMaterial}
          lights={campaignConfig.lights}
          defaultShadow={campaignConfig.defShadow}
          postProcessing={campaignConfig.postProcessing}
          editMode={isEditModeSelected}
          enablePan={enablePan}
          defaultCamera={campaignConfig.defCam}
        />
      </div>
      {isLoading ? <></> :
        <>
          {!onlyView &&
            <HudUI
              selectedOption={selectedOpc.find(e => e.id === selectedCategory)}

              editModeSelected={isEditModeSelected}

              selectListCategory={[...selectListFeatures, ...selectListAccessories]}
              // selectListFeatures={[...selectListFeatures, ...selectListAccessories]}
              // selectListAccessories={selectListAccessories}

              // optionList
              optionList={optionListShow}
              // featureList={featureListShow}
              // accessoryList={accessoryListShow}

              // selectedCategory
              selectedCategory={selectedCategory}
              // selectedFeature={selectedFeature}
              // selectedAcc={selectedAcc}

              campaignSkinColorConfig={campaignConfig.skin || {}}
              skinColor={skinColor}
              changeView={() => {
                setIsEditModeSelected(!isEditModeSelected);
                void updateStage(!isEditModeSelected);
                updateCamMode(!isEditModeSelected);
              }}

              // changeCategory
              onOptionChange={(id: string, path: string, name: string) => void onOptionChange(id, path, name)}
              // changeFeature={(id: string, path: string, name: string) => void onChangeFeature(id, path, name)}
              // changeAccessory={(id: string, path: string, name: string) => void onChangeAccessory(id, path, name)}

              // onCategoryChange
              onCategoryTypeChange={(value: string) => onCategoryTypeChange(value)}
              // onFeatureTypeChange={(value: string) => onFeatureTypeChange(value)}
              // onAccessoryTypeChange={(value: string) => onAccessoryTypeChange(value)}


              onSkinColorChange={(value: string) => void onClickChangeSkinColor(value)}
              exportModel={(type) => exportModel(type)}
              exportAllow={campaignConfig.extraExport}
            />
          }
        </>
      }
    </>
  );
}