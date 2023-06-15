import {useEffect, useRef, useState} from "react";
import Head from "next/head";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
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
  EnvironmentInterface,
  FeatureInterface,
  SingleInterface,
  EnvMapInterface
} from "../../interfaces/api.interface";
import {IFrameExportData, IFrameReady, SetIFrameEvents} from "../../utils/iframe.util";
import {ExportAttributeValues, GlobalValues, Module} from "../../enums/common.enum";
import {FilterList, LogError, RandomArrayElement} from "../../utils/common.util";
import {
  GetAccessoryListByCampaign,
  GetAnimationListByCampaign,
  GetAssetsListByCampaign,
  GetEnvironmentListByCampaign,
  GetAvatarSingleByCampaignCombination,
  GetEnvMapListByCampaign
} from "../../utils/api.util";
import {SaveFile} from "../../utils/exporter.util";
import AGLoading from "../../ui/common/ag-loading.component";
import HudComponent from "../../ui/avatar/hud.component";
import AvatarEditor, {
  ChangeAccessory,
  ChangeFeature, ChangeSkinColor,
  ChangeStartAnimation,
  GetAvatarGLB,
  GetWearableOption,
  RemoveEnvironment,
  SetEnvironment,
  SetFeaturesData
} from "./editor.component";
import {AGChangeCamPosition, AGChangeLookAtPosition, SetEnvironmentMap, TakeCanvasPicture} from "./viewer.component";

interface AvatarBuilderProps {
  campaign: string;
  avatarBasePath: string;
  campaignConfig: CampaignConfig;
  selectListFeatures: FeatureBasic[];
  selectListAccessories: BasicData[];
  attributeConfig?: BasicData[];
  bgColor?: string;
  onlyView: boolean;
}

let featureList: FeatureInterface[] | undefined;
let accessoryList: AccessoryInterface[] | undefined;
let animationList: AnimationInterface[] | undefined;
let environmentList: EnvironmentInterface[] | undefined;
let envMapList: EnvMapInterface[] | undefined;
let singleData: SingleInterface | undefined;

const exportData: ExportInterface = {attributes: []};
let onIFrame = false;

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
                                       bgColor
                                     }: AvatarBuilderProps) {
  const [selectedFeature, setSelectedFeature] = useState<string>(selectListFeatures.length > 0 ? selectListFeatures[0].id : '');
  const [selectedAcc, setSelectedAcc] = useState<string>(selectListAccessories.length > 0 ? selectListAccessories[0].id : '');
  const [skinColor, setSkinColor] = useState<string>(campaignConfig.defSkinColor ?? 'F2A47E');
  const [editModeSelected, setEditModeSelected] = useState<boolean>(false);
  const [featuresSelected, setFeaturesSelected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [featureListShow, setFeatureListShow] = useState<FeatureInterface[]>();
  const [accessoryListShow, setAccessoryListShow] = useState<AccessoryInterface[]>();
  const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(exportData.attributes);
  
  const startPromises = useRef<Promise<unknown>>();

  useEffect(() => {
    if (!onlyView) setEditModeSelected(true);

    startPromises.current = Promise.all([
      getFeatureList(),
      getAccessoryList(),
      getAnimationList(),
      getEnvironmentList(),
      getEnvironmentMapList(),
      getSingleInfo()
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAvatarBuilderReady() {
    await startPromises.current;
    await SetFeaturesData(selectListFeatures);

    await loadPreData();
    await onClickChangeSkinColor();

    const envMap = envMapList?.find(em => em.name === campaignConfig.defEnvMap) ?? envMapList?.at(0) ;
    await SetEnvironmentMap(envMap?.path);
    
    const startAnimation = animationList?.find(a => a.name == campaignConfig.defAnimation) ?? animationList?.at(0);
    await ChangeStartAnimation(startAnimation?.path);

    setLoading(false);

    IFrameReady(setOnIFrame);
  }

  const setOnIFrame = () => {
    // console.log('IFrame Callback: ', onIFrame);
    onIFrame = true;
    SetIFrameEvents(changeFeatureFromIFrame, exportFromIFrame, changeSkinColorFromIFrame);
  }

  async function changeFeatureFromIFrame(params?: BasicData) {
    if (!onIFrame) return LogError(Module.AvatarGenerator, "Not on IFrame, subscribe if you forgot!");
    if (!params) return LogError(Module.AvatarGenerator, "Missing feature option!");

    if (params.detail && params.detail.startsWith('http')) {
      if (params.id.endsWith(GlobalValues.AccEnd)) {
        await ChangeAccessory(`${params.id}_${params.val}_${params.detail}`, params.detail, params.val, params.id, campaignConfig.changeMaterial);
      } else {
        await onChangeFeature(`${params.id}_${params.val}_${params.detail}`, params.detail, params.val, params.id);
      }
    } else {
      if (params.id.endsWith(GlobalValues.AccEnd)) {
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
    return exportModel();
  }

  async function loadPreData() {
    if (campaignConfig.defStart != undefined && singleData != undefined) {
      await updateAvatarSingleData();
      return;
    }
    
    if (!(featureList && accessoryList))
      return LogError(Module.AvatarGenerator, "No feature/accessory list!");

    if (campaign && campaign !== GlobalValues.BaseCampaign) {
      exportData?.attributes.push({id: ExportAttributeValues.Campaign, val: campaign});
    }

    if (attributeConfig) {
      for (const attribute of attributeConfig) {
        // Is a feature
        if (selectListFeatures.some(pl => pl.id === attribute.id)) {
          const newFeature = featureList.find(p => p.name === attribute.val && p.type === attribute.id);
          if (newFeature)
            await onChangeFeature(newFeature.id, newFeature.path, newFeature.name, attribute.id);
        }
        // Is an accessory
        else if (selectListAccessories.some(pl => pl.id === attribute.id)) {
          const newAcc = accessoryList.find(p => p.name === attribute.val && p.type === attribute.id);
          if (newAcc)
            await ChangeAccessory(newAcc.id, newAcc.path, newAcc.name, attribute.id, campaignConfig.changeMaterial);
        }
      }
    } else {
      const randomFeature: FeatureInterface[] = [];
      const randomAccessory: AccessoryInterface[] = [];

      // Load random features
      for (const featureType of selectListFeatures) {
        const randomFeatureOption = RandomArrayElement(featureList.filter(p => p.type === featureType.id));
        if (randomFeatureOption)
          randomFeature.push(randomFeatureOption);
      }

      for (const accType of selectListAccessories) {
        const randomAcc = RandomArrayElement(accessoryList.filter(a => a.type === accType.id));
        if (randomAcc)
          randomAccessory.push(randomAcc);
      }

      const modelPromises: Promise<GLTF>[] = [];
      for (const feature of randomFeature)
        modelPromises.push(GetWearableOption(feature.id, feature.path));
      for (const acc of randomAccessory)
        modelPromises.push(GetWearableOption(acc.id, acc.path));
      await Promise.all([...modelPromises]);

      for (const feature of randomFeature)
        await onChangeFeature(feature.id, feature.path, feature.name, feature.type);
      for (const acc of randomAccessory)
        await ChangeAccessory(acc.id, acc.path, acc.name, acc.type, campaignConfig.changeMaterial);
    }
  }

  async function updateAvatarSingleData() {
    if (singleData == undefined) return void LogError(Module.AvatarGenerator, "Missing single data!");
    
    for (const {val: {id, path, type, name}} of singleData.features) {
      // Set feature on model
      await onChangeFeature(id, path, name, type);
    }
  }

  async function getFeatureList() {
    const {value: newAssetList} = await GetAssetsListByCampaign(campaign);
    featureList = newAssetList;
    setFeatureListShow(FilterList(featureList, "type", selectedFeature));
  }

  async function getAccessoryList() {
    const {value: newAccList} = await GetAccessoryListByCampaign(campaign);
    accessoryList = newAccList;
    setAccessoryListShow(FilterList(accessoryList, "type", selectedAcc));
  }

  async function getAnimationList() {
    const {value: newAnimationList} = await GetAnimationListByCampaign(campaign);
    animationList = newAnimationList;
  }
  
  async function getEnvironmentList() {
    const {value: newEnvironmentList} = await GetEnvironmentListByCampaign(campaign);
    environmentList = newEnvironmentList;
  }
  
  async function getEnvironmentMapList() {
    if (campaign == undefined) return;
    const {value: newEnvMapList} = await GetEnvMapListByCampaign(campaign);
    envMapList = newEnvMapList;
  }
  
  async function getSingleInfo() {
    if (campaignConfig.defStart == undefined) return;
    
    const {value: reqSingleData} = await GetAvatarSingleByCampaignCombination(campaign, campaignConfig.defStart);
    singleData = reqSingleData;
  }

  async function onClickChangeSkinColor(newSkinColor = skinColor) {
    await ChangeSkinColor(newSkinColor, campaignConfig.defSkin);
    setSkinColor(newSkinColor);
  }

  function onCategoryChange(value: string) {
    setSelectedFeature(value);
    setFeatureListShow(FilterList(featureList, "type", value));
    updateFeatureCamPosition(value, campaignConfig.featuresCamPos);
  }

  function onAccessoryChange(value: string) {
    setSelectedAcc(value);
    setAccessoryListShow(FilterList(accessoryList, "type", value));
    updateFeatureCamPosition(value, campaignConfig.accCamPos);
  }

  function updateFeatureCamPosition(index: string, posLocation?: Record<string, LookAtVectors>) {
    const confRef = posLocation ? posLocation[index] : undefined;
    if (confRef == undefined) return;
    
    AGChangeCamPosition(confRef.pos);
    AGChangeLookAtPosition(confRef.lookAt);
  }

  async function onChangeFeature(id: string, featurePath: string, name: string, _selectedFeature: string = selectedFeature) {
    await ChangeFeature(id, featurePath, name, _selectedFeature, skinColor, campaignConfig.defSkin, campaignConfig.changeMaterial);
    // TODO: find ways to avoid this
    await SetFeaturesData(selectListFeatures);
    addReplaceAttribute(_selectedFeature, name);
  }

  async function onChangeAccessory(id: string, path: string, name: string, _selectedAcc: string = selectedAcc) {
    await ChangeAccessory(id, path, name, _selectedAcc, campaignConfig.changeMaterial);
    addReplaceAttribute(selectedAcc, name);
  }

  function addReplaceAttribute(addId: string, addValue: string) {
    if (exportData && exportData.attributes.some(x => x.id === addId)) {
      const oldAttribute = exportData.attributes.find(x => x.id === addId);
      if (oldAttribute)
        oldAttribute.val = addValue;

      setSelectedOpc([...exportData.attributes]);
      return;
    }

    exportData?.attributes.push({id: addId, val: addValue});
    setSelectedOpc([...exportData.attributes]);
  }

  async function exportModel() {
    exportData.attributesBase64 = window.btoa(JSON.stringify(exportData.attributes));
    const [picturePromise, modelPromise] = await Promise.all([
      TakeCanvasPicture(),
      GetAvatarGLB()
    ]);
    exportData.picture = picturePromise;
    exportData.model = modelPromise;

    // eslint-disable-next-line no-console
    console.log(exportData);
    
    if (onIFrame) {
      IFrameExportData(exportData);
    } else {
      if (exportData.model != undefined)
        await SaveFile(exportData.model, 'model.glb');

      await SaveFile(exportData.picture, 'picture.png');
    }
  }

  async function updateEnvironment(isEditMode: boolean) {
    if(isEditMode) {
      RemoveEnvironment();
    }
    else {
      const defEnv = environmentList?.find(env => env.name == campaignConfig.defEnvironment);
      await SetEnvironment(defEnv?.path);
    }
  }

  return (
    <>
      <Head>
        <title>Avatar Generator</title>
      </Head>
      {/* LOADING */}
      <AGLoading loading={loading} bgColor={bgColor}/>
      {/* CANVAS WRAPPER */}
      <div
        className="fixed left-[50%] translate-x-[-50%] flex justify-center xl:justify-end items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
        {/* CANVAS BACKGROUND */}
        <div style={{backgroundColor: `#${bgColor ?? '272727'}`}} className="w-full h-screen absolute"/>
        {/* CANVAS */}
        <AvatarEditor avatarBasePath={avatarBasePath}
                      onReady={() => onAvatarBuilderReady()}
                      changeMaterial={campaignConfig.changeMaterial}
                      lights={campaignConfig.lights}
                      editMode={editModeSelected}
        />
      </div>
      {loading ? <></> :
        <>
          {!onlyView &&
              <HudComponent
                  exportData={selectedOpc}
                  editModeSelected={editModeSelected}
                  selectListFeatures={selectListFeatures}
                  featureList={featureListShow}
                  selectedFeature={selectedFeature}
                  selectListAccessories={selectListAccessories}
                  accessoryList={accessoryListShow}
                  selectedAcc={selectedAcc}
                  skinColor={skinColor}
                  changeView={() => {
                    setEditModeSelected(!editModeSelected);
                    void updateEnvironment(!editModeSelected);
                  }}
                  changeFeature={(id: string, path: string, name: string) => void onChangeFeature(id, path, name)}
                  onCategoryChange={(value: string) => onCategoryChange(value)}
                  onAccessoryChange={(value: string) => onAccessoryChange(value)}
                  onClickChangeSkinColor={(value: string) => void onClickChangeSkinColor(value)}
                  exportModel={() => void exportModel()}
              />
          }
        </>
      }
    </>
  );
}