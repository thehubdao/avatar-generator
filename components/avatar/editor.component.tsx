import {useEffect, useState} from "react";
import {Clock, Vector3} from "three";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {
  AccessoryInfoInterface,
  BasicData,
  CampaignConfig,
  ExportInterface,
  FeatureInfoInterface,
  LookAtVectors
} from "../../interfaces/common.interface";
import {SceneInterface} from "../../interfaces/scene.interface";
import {AccessoryInterface, AnimationInterface, FeatureInterface} from "../../interfaces/api.interface";
import {IFrameExportData, IFrameReady, SetIFrameEvents} from "../../utils/iframe.util";
import {ExportAttributeValues, GlobalValues, Module} from "../../enums/common.enum";
import {LogError, RandomArrayElement} from "../../utils/common.util";
import {GetAccessoryListByCampaign, GetAnimationListByCampaign, GetAssetsListByCampaign} from "../../utils/api.util";
import {FirebaseGltfModel, GetFeaturesData, GetGltfModel} from "../../utils/importer.util";
import {FrustumCulledFalse, InitSceneController} from "../../utils/threejs/scene.util";
import {GetAmbientLights, GetTestLights} from "../../utils/test-scene.util";
import {CreateAnimationMixer, SetAnimation} from "../../utils/threejs/animation.util";
import {
  ChangeObjectSkinColor,
  ReplaceModelAccessory,
  ReplaceModelFeatureOnly,
  TransformObject3dToToonMaterial
} from "../../utils/model.util";
import {ExportModelGlb, SaveFile} from "../../utils/exporter.util";
import AGLoading from "../common/ag-loading.component";
import Head from "next/head";
import HudComponent from "./hud.component";

interface AvatarEditorProps {
  campaign?: string | null;
  avatarBasePath: string;
  campaignConfig: CampaignConfig;
  selectListFeatures: BasicData[];
  selectListAccessories: BasicData[];
  attributeConfig: BasicData[] | null;
  // callback when data is ready to be used
  onDataLoaded?: () => void;
  bgColor?: string;
  onlyView: boolean;
}

let cameraPos: Vector3 = new Vector3();
let cameraLookAt: Vector3 = new Vector3();

let threeCanvas: HTMLDivElement | null = null;
const clock: Clock = new Clock();
let sc: SceneInterface | undefined;

const savedModels: Record<string, GLTF> = {};

let doCameraMovement = false;

const accessoryListData: Record<string, AccessoryInfoInterface> = {};
let featureListData: Record<string, FeatureInfoInterface> | undefined;
let featureList: FeatureInterface[] | undefined;
let accessoryList: AccessoryInterface[] | undefined;
let animationList: AnimationInterface[] | undefined;
const exportData: ExportInterface = {attributes: []};

let tanFOV: number | undefined;
let windowHeight: number | undefined;
let onIFrame = false;

export default function AvatarEditor({
                                       selectListFeatures,
                                       selectListAccessories,
                                       onlyView,
                                       onDataLoaded,
                                       campaign,
                                       attributeConfig,
                                       avatarBasePath,
                                       campaignConfig,
                                       bgColor
                                     }: AvatarEditorProps) {
  const [selectedFeature, setSelectedFeature] = useState<string>(selectListFeatures.length > 0 ? selectListFeatures[0].id : '');
  const [selectedAcc, setSelectedAcc] = useState<string>(selectListAccessories.length > 0 ? selectListAccessories[0].id : '');
  const [skinColor, setSkinColor] = useState<string>(campaignConfig.defSkinColor ?? 'F2A47E');
  const [editModeSelected, setEditModeSelected] = useState<boolean>(false);
  const [featuresSelected, setFeaturesSelected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [featureListShow, setFeatureListShow] = useState<FeatureInterface[]>();
  const [accessoryListShow, setAccessoryListShow] = useState<AccessoryInterface[]>();
  const [selectedOpc, setSelectedOpc] = useState<BasicData[]>(exportData.attributes);

  useEffect(() => {
    const componentDidMount = async () => {
      if (!onlyView) setEditModeSelected(true);

      await avatarScene();

      await Promise.all([
        getFeatureList(),
        getAccessoryList(),
        getAnimationList()
      ]);
      
      await getFeaturesData();
      await onClickChangeSkinColor();
      await loadPreData();
      await onClickChangeSkinColor();

      setLoading(false);
      // trigger event when component has all data to render
      onDataLoaded?.()

      IFrameReady(setOnIFrame);
    };

    componentDidMount()
      .catch(err => console.error(err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setOnIFrame = () => {
    console.log('IFrame Callback: ', onIFrame);
    onIFrame = true;
    SetIFrameEvents(changeFeatureFromIFrame, exportFromIFrame, changeSkinColorFromIFrame);
  }

  const changeFeatureFromIFrame = async (params?: BasicData) => {
    if (!onIFrame) return console.log("Not on IFrame, subscribe if you forgot!");
    if (!params) return console.log("Missing feature option!");

    if (params.detail && params.detail.startsWith('http')) {
      await changeFeature(`${params.id}_${params.val}_${params.detail}`, params.detail, params.val, params.id);
    } else {
      if (params.id.endsWith(GlobalValues.AccEnd)) {
        const accessory = accessoryList?.find(a => a.type === params.id && a.name === params.val);

        if (!accessory) return console.log("Accessory option not found!");
        await changeAccessory(accessory.id, accessory.path, accessory.name, accessory.type);
      } else {
        const feature = featureList?.find(p => p.type === params.id && p.name === params.val);

        if (!feature) return console.log("Feature option not found!");
        await changeFeature(feature.id, feature.path, feature.name, feature.type);
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
            await changeFeature(newFeature.id, newFeature.path, newFeature.name, attribute.id);
        }
        // Is an accessory
        else if (selectListAccessories.some(pl => pl.id === attribute.id)) {
          const newAcc = accessoryList.find(p => p.name === attribute.val && p.type === attribute.id);
          if (newAcc)
            await changeAccessory(newAcc.id, newAcc.path, newAcc.name, attribute.id);
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
        modelPromises.push(getWearableOption(feature.id, feature.path));
      for (const acc of randomAccessory)
        modelPromises.push(getWearableOption(acc.id, acc.path));
      await Promise.all([...modelPromises]);

      for (const feature of randomFeature)
        await changeFeature(feature.id, feature.path, feature.name, feature.type);
      for (const acc of randomAccessory)
        await changeAccessory(acc.id, acc.path, acc.name, acc.type);
    }
  }

  async function getFeatureList() {
    const {value: newAssetList} = await GetAssetsListByCampaign(campaign);
    featureList = newAssetList;
    setFeatureListShow(filterList(featureList, selectedFeature));
  }

  async function getAccessoryList() {
    const {value: newAccList} = await GetAccessoryListByCampaign(campaign);
    accessoryList = newAccList;
    setAccessoryListShow(filterList(accessoryList, selectedAcc));
  }

  async function getAnimationList() {
    const {value: newAnimationList} = await GetAnimationListByCampaign(campaign);
    animationList = newAnimationList;
  }
  
  const filterList = (list: (FeatureInterface | AccessoryInterface)[] | undefined, type: string) => {
    if(list == undefined)
      return void LogError(Module.AvatarGenerator, "Missing feature/accessory list!");
      
    return list.filter(l => l.type === type);
  }

  async function getFeaturesData() {
    if (!(sc && sc.armature)) return LogError(Module.AvatarGenerator, "Missing armature!")

    featureListData = await GetFeaturesData(sc.armature.scene, selectListFeatures);
  }

  async function avatarScene() {
    if (!threeCanvas) return LogError(Module.AvatarGenerator, "Error initializing canvas!");

    sc = InitSceneController();
    if (!sc) return LogError(Module.AvatarGenerator, "Error initializing scene!");

    // mount scene
    threeCanvas.appendChild(sc.renderer.domElement);

    cameraPos = sc.camera.position.clone();
    cameraLookAt = sc.controls.target.clone();

    // Add test assets
    // this.scene.add(GetTestCube());
    // this.scene.add(GetTestAxis(5));

    const lights = GetTestLights();
    for (const l of lights) {
      sc.scene.add(l);
    }
    const aLights = GetAmbientLights();
    for (const l of aLights) {
      sc.scene.add(l);
    }

    sc.armature = await FirebaseGltfModel(avatarBasePath);
    // console.log('Base start', this.sc.armature);

    sc.mixer = CreateAnimationMixer(sc.armature.scene);
    await SetAnimation(sc.mixer, sc.armature, undefined);

    await TransformObject3dToToonMaterial(sc.armature.scene);
    sc.scene.add(sc.armature.scene);

    // remember these initial values
    tanFOV = Math.tan(((Math.PI / 180) * sc.camera.fov / 2));
    windowHeight = window.innerHeight;

    window.addEventListener('resize', onWindowResize, false);

    FrustumCulledFalse(sc.scene);

    Animate();
  }

  const onWindowResize = () => {
    if (!sc) return void LogError(Module.AvatarGenerator, "Missing scene");
    if (!(tanFOV && windowHeight))
      return void LogError(Module.AvatarGenerator, "Missing fov/windowHeight on resize!");

    sc.camera.aspect = window.innerWidth / window.innerHeight;

    // adjust the FOV
    sc.camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight));

    sc.camera.updateProjectionMatrix();
    //this.camera!.lookAt(this.scene!.position);

    sc.renderer.setSize(window.innerWidth, window.innerHeight);
    sc.renderer.render(sc.scene, sc.camera);
  }

  // Animate the scene
  const Animate = () => {
    if (!sc) return void LogError(Module.AvatarGenerator, "Missing three scene");
    requestAnimationFrame(Animate);

    const delta = clock.getDelta();
    if (sc.mixer) sc.mixer.update(delta);

    sc.controls.update();

    if (sc.camera.position.distanceTo(cameraPos) < 0.1) {
      doCameraMovement = false;
    }

    if (doCameraMovement)
      sc.camera.position.lerp(cameraPos, delta);

    sc.renderer.render(sc.scene, sc.camera);
  }

  function changeCamPosition(value: Vector3) {
    if (!sc) return void LogError(Module.AvatarGenerator, "Missing scene");

    doCameraMovement = true;
    sc.controls.autoRotate = false;
    cameraPos = value;
  }

  function changeLookAtPosition(value: Vector3 = cameraLookAt.clone()) {
    if (!sc) return void LogError(Module.AvatarGenerator, "Missing Scene");
    sc.controls.target = value;
  }

  async function onClickChangeSkinColor(newSkinColor = skinColor) {
    if (!(sc && sc.armature)) return LogError(Module.AvatarGenerator, "Missing armature for skin color change");
    if (newSkinColor == undefined) return LogError(Module.AvatarGenerator, "Missing new skin color");

    await ChangeObjectSkinColor(sc.armature.scene, newSkinColor);
    setSkinColor(newSkinColor);
  }

  function onCategoryChange(value: string) {
    setSelectedFeature(value);
    setFeatureListShow(filterList(featureList, value));
    setFeatureCamPosition(value, campaignConfig.featuresCamPos);
  }

  function onAccessoryChange(value: string) {
    setSelectedAcc(value);
    setAccessoryListShow(filterList(accessoryList, value));
    setFeatureCamPosition(value, campaignConfig.accCamPos);
  }

  function setFeatureCamPosition(index: string, posLocation?: Record<string, LookAtVectors>) {
    const confRef = posLocation ? posLocation[index] : undefined;
    if (confRef) {
      changeCamPosition(new Vector3(confRef.pos?.x, confRef.pos?.y, confRef.pos?.z));
      changeLookAtPosition(new Vector3(confRef.lookAt?.x, confRef.lookAt?.y, confRef.lookAt?.z));
    }
  }

  async function getWearableOption(id: string, optionPath: string) {
    let replaceModel: GLTF;
    if (savedModels[id]) {
      replaceModel = savedModels[id];
    } else {
      replaceModel = await GetGltfModel(optionPath);
      savedModels[id] = replaceModel;
    }

    return replaceModel;
  }

  async function changeFeature(id: string, featurePath: string, name: string, _selectedFeature: string = selectedFeature) {
    if (!(sc && sc.armature)) return LogError(Module.AvatarGenerator, "Missing armature in order to change feature");
    if (!featureListData) return LogError(Module.AvatarGenerator, "Missing feature list data");

    const replaceModel = await getWearableOption(id, featurePath);

    await ReplaceModelFeatureOnly(sc.armature.scene.children[0], replaceModel, featureListData[_selectedFeature], selectListFeatures.find(sl => sl.id === _selectedFeature), skinColor);
    await getFeaturesData();
    addReplaceAttribute(_selectedFeature, name);
  }

  async function changeAccessory(id: string, path: string, name: string, _selectedAcc: string = selectedAcc) {
    if (!(sc && sc.armature)) return LogError(Module.AvatarGenerator, "Missing armature in order to change accessory");
    if (!accessoryListData) return LogError(Module.AvatarGenerator, "Missing accessory data");

    const replaceModel = await getWearableOption(id, path);
    
    await ReplaceModelAccessory(sc?.armature.scene.children[0], replaceModel, accessoryListData, selectedAcc);
    addReplaceAttribute(_selectedAcc, name);
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

  function takeExportPicture(mimeType = 'image/png') {
    return new Promise<Blob>((resolve, reject) => {
      if (!sc) return reject("Missing scene");

      sc.renderer.domElement.toBlob(blob => {
        if (blob) {
          resolve(blob);
        }
      }, mimeType);
    });
  }

  async function exportModel() {
    if (!(sc && sc.armature)) return LogError(Module.AvatarGenerator, "Missing armature on export");

    exportData.attributesBase64 = window.btoa(JSON.stringify(exportData.attributes));
    const [picturePromise, modelPromise] = await Promise.all([
      takeExportPicture(),
      ExportModelGlb(sc.armature)
    ]);
    exportData.picture = picturePromise;
    exportData.model = modelPromise;

    console.log(exportData);
    if (onIFrame) {
      IFrameExportData(exportData);
    } else {
      await SaveFile(exportData.model, 'model.glb');
      await SaveFile(exportData.picture, 'picture.png');
    }
  }

  function renderEditMode() {
    return (
      <>
        {/* LOADING */}
        <AGLoading loading={loading} bgColor={bgColor}/>
        {/* CANVAS WRAPPER */}
        <div
          className="fixed left-[50%] translate-x-[-50%] flex justify-center items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
          {/* CANVAS BACKGROUND */}
          <div style={{backgroundColor: `#${bgColor ?? '272727'}`}} className="w-full h-screen absolute"/>
          {/* CANVAS */}
          <div className="relative h-full" ref={ref => threeCanvas = ref}/>
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
                  changeView={() => setEditModeSelected(!editModeSelected)}
                  changeFeature={(id: string, path: string, name: string) => void changeFeature(id, path, name)}
                  onCategoryChange={(value: string) => onCategoryChange(value)}
                  onAccessoryChange={(value: string) => onAccessoryChange(value)}
                  onClickChangeSkinColor={(value:string) => void onClickChangeSkinColor(value)}
                  exportModel={() => void exportModel()}
                />
            }
          </>
        }
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Avatar Generator</title>
      </Head>
      {renderEditMode()}
    </>
  );
}