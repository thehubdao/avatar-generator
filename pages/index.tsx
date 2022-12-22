import {useEffect, useState} from "react";
import Image from "next/image";
import Head from "next/head";
import {Clock, Vector3} from "three";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GetServerSideProps} from "next";

import AGLoading from "../components/common/ag-loading.component";
import {FrustumCulledFalse, InitSceneController} from "../utils/threejs/scene.util";
import {GetAmbientLights, GetTestLights} from "../utils/test-scene.util";
import {FirebaseGltfModel, GetAccessoryBones, GetFeaturesData, GetGltfModel,} from "../utils/importer.util";
import {ExportAttributeValues, GlobalValues, Module, ViewModuleState} from "../enums/common.enum";
import {FirestoreParameters} from "../enums/firebase.enum";
import {AccessoryInterface, AnimationInterface, FeatureInterface} from "../interfaces/api.interface";
import {
  ChangeObjectSkinColor,
  ReplaceModelAccessory,
  ReplaceModelFeatureOnly,
  TransformObject3dToToonMaterial
} from "../utils/model.util";
import {ExportModelGlb, SaveFile} from "../utils/exporter.util";
import {
  AccessoryInfoInterface,
  BasicData,
  CampaignConfig,
  ExportInterface,
  FeatureInfoInterface,
  LookAtVectors
} from "../interfaces/common.interface";
import {GetParameters} from "../utils/firebase.util";
import {Delay, LogError, RandomArrayElement} from "../utils/common.util";
import FeatureSelectorComponent from "../components/selectors/featureSelector.component";
import OptionSelectorComponent from "../components/selectors/optionSelector.component";
import ColorSelectorComponent from "../components/selectors/colorSelector.component";
import {IFrameExportData, IFrameReady, SetIFrameEvents} from "../utils/iframe.util";
import {CreateAnimationMixer, SetAnimation} from "../utils/threejs/animation.util";
import {SceneInterface} from "../interfaces/scene.interface";
import {GetAccessoryListByCampaign, GetAnimationListByCampaign, GetAssetsListByCampaign} from "../utils/api.util";

export interface AvatarGeneratorProps {
  campaign?: string | null;
  baseMeshPath: string;
  campaignConfig: CampaignConfig;
  selectListBodyFeatures: BasicData[];
  selectListAccessories: BasicData[];
  attributeConfig: BasicData[] | null;
  // callback when data is ready to be used
  onDataLoaded?: () => void;
  bgColor?: string;
  onlyView: boolean;
}

export default function AvatarGenerator({
                                          selectListBodyFeatures,
                                          selectListAccessories,
                                          onlyView,
                                          onDataLoaded,
                                          campaign,
                                          attributeConfig,
                                          baseMeshPath,
                                          campaignConfig,
                                          bgColor
                                        }: AvatarGeneratorProps) {
  const [selectedFeature, setSelectedFeature] = useState<string>(selectListBodyFeatures[0].id);
  const [selectedAcc, setSelectedAcc] = useState<string>(selectListAccessories[0].id);
  const [cameraPos, setCameraPos] = useState<Vector3>(new Vector3());
  const [cameraLookAt, setCameraLookAt] = useState<Vector3>(new Vector3());
  const [skinColor, setSkinColor] = useState<string>('F2A47E');
  const [editModeSelected, setEditModeSelected] = useState<boolean>(false);
  const [featuresSelected, setFeaturesSelected] = useState<boolean>(true);
  const [currentModule, setCurrentModule] = useState<ViewModuleState>(ViewModuleState.OnModule);
  const [loading, setLoading] = useState<boolean>(true);

  const featureSelectList: BasicData[] = selectListBodyFeatures;
  const accSelectList: BasicData[] = selectListAccessories;
  
  let threeCanvas: HTMLDivElement | null = null;
  const clock: Clock = new Clock();
  let sc: SceneInterface | undefined;

  const savedModels: Record<string, GLTF> = {};

  let doCameraMovement = false;

  let accessoryBonesData: Record<string, AccessoryInfoInterface> | undefined;
  let featureListData: Record<string, FeatureInfoInterface> | undefined;
  let featureList: FeatureInterface[] | undefined;
  let accessoryList: AccessoryInterface[] | undefined;
  let animationList: AnimationInterface[] | undefined;
  const exportData: ExportInterface = {attributes: []};

  let tanFOV: number | undefined;
  let windowHeight: number | undefined;
  let onIFrame = false;

  useEffect(() => {
    const componentDidMount = async () => {
      if (!onlyView) await changeView();

      await avatarScene();

      await Promise.all([
        getFeatureList(),
        getAccessoryList(),
        getAnimationList()
      ]);

      await getAccessoryBones();
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

  useEffect(() => {
    if (threeCanvas && currentModule !== ViewModuleState.OnModule) {
      if (!sc) return void LogError(Module.AvatarGenerator, "Missing scene on view transition");

      threeCanvas.appendChild(sc.renderer.domElement);
      setCurrentModule(ViewModuleState.OnModule);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModule]);

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
        if (featureSelectList.some(pl => pl.id === attribute.id)) {
          const newFeature = featureList.find(p => p.name === attribute.val && p.type === attribute.id);
          if (newFeature)
            await changeFeature(newFeature.id, newFeature.path, newFeature.name, attribute.id);
        }
        // Is an accessory
        else if (accSelectList.some(pl => pl.id === attribute.id)) {
          const newAcc = accessoryList.find(p => p.name === attribute.val && p.type === attribute.id);
          if (newAcc)
            await changeAccessory(newAcc.id, newAcc.path, newAcc.name, attribute.id);
        }
      }
    } else {
      const randomFeature: FeatureInterface[] = [];
      const randomAccessory: AccessoryInterface[] = [];

      // Load random features
      for (const featureType of featureSelectList) {
        const randomFeatureOption = RandomArrayElement(featureList.filter(p => p.type === featureType.id));
        if (randomFeatureOption)
          randomFeature.push(randomFeatureOption);
      }

      for (const accType of accSelectList) {
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
  }

  async function getAccessoryList() {
    const {value: newAccList} = await GetAccessoryListByCampaign(campaign);
    accessoryList = newAccList;
  }

  async function getAnimationList() {
    const {value: newAnimationList} = await GetAnimationListByCampaign(campaign);
    animationList = newAnimationList;
  }

  async function getFeaturesData() {
    if (!(sc && sc.armature)) return LogError(Module.AvatarGenerator, "Missing armature!")

    featureListData = await GetFeaturesData(sc.armature.scene, featureSelectList);
  }

  async function getAccessoryBones() {
    if (!(sc && sc.armature)) return LogError(Module.AvatarGenerator, "Missing armature!");

    accessoryBonesData = await GetAccessoryBones(sc.armature.scene, accSelectList);
  }

  async function avatarScene() {
    if (!threeCanvas) return LogError(Module.AvatarGenerator, "Error initializing canvas!");

    sc = InitSceneController();
    if (!sc) return LogError(Module.AvatarGenerator, "Error initializing scene!");

    // mount scene
    threeCanvas.appendChild(sc.renderer.domElement);

    setCameraPos(sc.camera.position.clone());
    setCameraLookAt(sc.controls.target.clone());

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

    sc.armature = await FirebaseGltfModel(baseMeshPath);
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
    setCameraPos(value);
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
    setFeatureCamPosition(value, campaignConfig.featuresCamPos);
  }

  function onAccessoryChange(value: string) {
    setSelectedAcc(value);
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

    await ReplaceModelFeatureOnly(sc.armature.scene.children[0], replaceModel, featureListData[_selectedFeature], featureSelectList.find(sl => sl.id === _selectedFeature), skinColor);
    await getFeaturesData();
    addReplaceAttribute(_selectedFeature, name);
  }

  async function changeAccessory(id: string, path: string, name: string, _selectedAcc: string = selectedAcc) {
    if (!accessoryBonesData) return LogError(Module.AvatarGenerator, "Missing accessory data");

    const replaceModel = await getWearableOption(id, path);

    ReplaceModelAccessory(accessoryBonesData, _selectedAcc, replaceModel);
    addReplaceAttribute(_selectedAcc, name);
  }

  function addReplaceAttribute(addId: string, addValue: string) {
    if (exportData && exportData.attributes.some(x => x.id === addId)) {
      const oldAttribute = exportData.attributes.find(x => x.id === addId);
      if (oldAttribute)
        oldAttribute.val = addValue;
      return;
    }

    exportData?.attributes.push({id: addId, val: addValue});
  }

  function takeExportPicture() {
    return new Promise<Blob>((resolve, reject) => {
      if (!sc) return reject("Missing scene");

      const mimeType = 'image/png';
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

  async function changeView() {
    if (!threeCanvas) return LogError(Module.AvatarGenerator, "Missing canvas");

    if (editModeSelected) {
      setEditModeSelected(false);
      setCurrentModule(ViewModuleState.SwitchingModule);
    } else {
      await Delay(500);
      setEditModeSelected(true);
      setCurrentModule(ViewModuleState.SwitchingModule);
    }
  }

  function renderEditMode() {
    return (
      <>
        <AGLoading loading={loading} bgColor={bgColor}/>
        {/* CANVAS WRAPPER */}
        <div
          className="fixed left-[50%] translate-x-[-50%] flex justify-center items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
          {/* CANVAS BACKGROUND */}
          <div style={{backgroundColor: `#${bgColor ?? '272727'}`}} className="w-full h-screen absolute"/>
          {/* CANVAS */}
          <div className="relative h-full" ref={ref => threeCanvas = ref}/>
        </div>
        {!onlyView &&
            <div onClick={() => void changeView()}
                 className="z-10 fixed top-4 right-4 bg-slate-100 border-2 border-slate-50 rounded-[4px] drop-shadow-md flex items-center justify-center px-2">
                <div className="m-2">
                  {
                    editModeSelected ?
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16px"
                           viewBox="0 0 511.996 511.996">
                        <path d="M508.245,246.953L363.435,102.133c-5.001-5.001-13.099-5.001-18.099,0c-5.001,5-5.001,13.099,0,18.099l122.965,122.965
                          H12.8c-7.074,0-12.8,5.726-12.8,12.8c0,7.074,5.726,12.8,12.8,12.8h455.492L345.327,391.763c-5.001,5-5.001,13.099,0,18.099
                          c5.009,5.001,13.099,5.001,18.108,0l144.811-144.811C513.246,260.051,513.246,251.953,508.245,246.953z"/>
                      </svg>
                      : <svg version="1.1" id="Layer_2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16px"
                             viewBox="0 0 217.855 217.855">
                        <path d="M215.658,53.55L164.305,2.196C162.899,0.79,160.991,0,159.002,0c-1.989,0-3.897,0.79-5.303,2.196L3.809,152.086
                        c-1.35,1.352-2.135,3.166-2.193,5.075l-1.611,52.966c-0.063,2.067,0.731,4.069,2.193,5.532c1.409,1.408,3.317,2.196,5.303,2.196
                        c0.076,0,0.152-0.001,0.229-0.004l52.964-1.613c1.909-0.058,3.724-0.842,5.075-2.192l149.89-149.889
                        C218.587,61.228,218.587,56.479,215.658,53.55z M57.264,201.336l-42.024,1.28l1.279-42.026l91.124-91.125l40.75,40.743
                        L57.264,201.336z M159,99.602l-40.751-40.742l40.752-40.753l40.746,40.747L159,99.602z"/>
                      </svg>

                  }
                </div>
                <div className="mr-2 text-xs">{editModeSelected ? 'NEXT' : 'EDIT'}</div>
            </div>
        }
        {editModeSelected ?
          <>
            <div className="fixed bottom-0 left-0 w-screen">
              <div className="w-full">
                {
                  featuresSelected &&
                    <OptionSelectorComponent list={featureList}
                                             activeOption={exportData?.attributes.find(o => o.id === selectedFeature)}
                                             handleClick={(id: string, path: string, name: string) => void changeFeature(id, path, name)}/>
                }
              </div>
              <div className="w-full bg-slate-100 flex">
                <div className="w-[calc(100%_-_60px)]">
                  {
                    featuresSelected ?
                      <FeatureSelectorComponent list={featureSelectList}
                                                activeFeature={selectedFeature}
                                                handleClick={(value: string) => onCategoryChange(value)}/>
                      :
                      <ColorSelectorComponent list={['F6C89B', 'E8A36F', '9F5835', 'F2A47E', 'C67E42']}
                                              activeColor={skinColor}
                                              handleClick={(value: string) => void onClickChangeSkinColor(value)}/>
                  }
                </div>
                <div className="w-[60px] pt-3" onClick={() => setFeaturesSelected(!featuresSelected)}>
                  <div className="border-l border-slate-400 text-center flex flex-col items-center">
                    <div className={"rounded-md w-[40px] h-[40px] flex justify-center items-center"}>
                      {
                        featuresSelected ?
                          <Image src='/resources/icons/buttons/head.svg' width={25} height={25} alt={'Color button'}
                                 className='opacity-70'/>
                          :
                          <Image src='/resources/icons/features/features.svg' width={30} height={30}
                                 alt={'Color button'} className='opacity-70'/>
                      }
                    </div>
                    <p
                      className='text-[10px] pt-1 opacity-50 w-[40px]'>{featuresSelected ? 'Skin' : 'Features'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
          : <>
            {!onlyView &&
                <div onClick={() => void exportModel()}
                     className="z-10 fixed bottom-4 right-4 bg-slate-100 border-2 border-slate-50 rounded-[4px] drop-shadow-md flex items-center justify-center px-2">
                    <div className="m-2">
                        <svg version="1.1" id="Layer_3" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16px"
                             viewBox="0 0 460 460">
                            <path d="M427.137,0C408.93,0,51.379,0,32.865,0C14.743,0,0,14.743,0,32.865v394.272c0,18.122,14.743,32.865,32.865,32.865
                      c0,0,374.895,0,394.272,0c18.122,0,32.865-14.743,32.865-32.865V32.865C460.001,14.743,445.258,0,427.137,0z M245.812,30h50.995
                      v54.466h-50.995V30z M107.198,30h108.615v69.466c0,8.284,6.716,15,15,15h80.995c8.284,0,15-6.716,15-15V30h26.377v119.636H107.198
                      V30z M107.007,430.001V308.673h245.986v121.328H107.007z M430.002,427.137L430.002,427.137c-0.001,1.58-1.286,2.865-2.866,2.865
                      h-44.143V293.673c0-8.284-6.716-15-15-15H92.007c-8.284,0-15,6.716-15,15v136.328H32.865c-1.58,0-2.865-1.285-2.865-2.865V32.865
                      C30,31.285,31.285,30,32.865,30h44.333v134.636c0,8.284,6.716,15,15,15h275.986c8.284,0,15-6.716,15-15V30h43.953
                      c1.58,0,2.865,1.285,2.865,2.865V427.137z"/>
                        </svg>
                    </div>
                    <div className="mr-2 text-xs">SAVE</div>
                </div>
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

export const getServerSideProps: GetServerSideProps<AvatarGeneratorProps> = async (context) => {
  const GV = GlobalValues;
  // Get subdomain
  let subdomain: string | undefined;
  let parsedConfig: BasicData[] | null = null;
  const {campaign, config, bg, ov} = context.query;
  if (campaign)
    subdomain = campaign as string;
  else
    subdomain = context.req.headers.host?.split(".")[0];

  if (config) {
    parsedConfig = JSON.parse(Buffer.from(config as string, 'base64').toString('ascii')) as BasicData[];
    if (parsedConfig && parsedConfig.some(x => x.id === ExportAttributeValues.Campaign)) {
      const configCampaign = parsedConfig.find(x => x.id === ExportAttributeValues.Campaign);
      if (configCampaign)
        subdomain = configCampaign.val;
    }
  }

  const campaigns = (await GetParameters<string[]>(undefined, FirestoreParameters.Campaigns))[0];
  const isCampaign = campaigns.some(c => c === subdomain);

  let _baseMeshPath: string;
  let _campaignConfig: CampaignConfig;
  let _selectListBodyFeatures: BasicData[];
  let _selectListAccessories: BasicData[];

  if (isCampaign && subdomain) {
    _baseMeshPath = `base_mesh/${subdomain}.glb`;
    const [bodyFeatureList, accessoryList, campaignConfig] = await GetParameters<BasicData[] | CampaignConfig>(undefined, subdomain, subdomain + GV.Acc, subdomain + GV.Config);
    _selectListBodyFeatures = bodyFeatureList as BasicData[];
    _selectListAccessories = accessoryList as BasicData[];
    _campaignConfig = campaignConfig as CampaignConfig;
  } else {
    _baseMeshPath = `base_mesh/${GV.BaseCampaign}.glb`;
    const [bodyFeatureList, accessoryList, campaignConfig] = await GetParameters<BasicData | CampaignConfig>(undefined, GV.BaseCampaign, GV.BaseCampaign + GV.Acc, GV.BaseCampaign + GV.Config);
    _selectListBodyFeatures = bodyFeatureList as BasicData[];
    _selectListAccessories = accessoryList as BasicData[];
    _campaignConfig = campaignConfig as CampaignConfig;
  }

  return {
    props: {
      campaign: isCampaign ? subdomain : null,
      baseMeshPath: _baseMeshPath,
      campaignConfig: _campaignConfig ?? {},
      selectListBodyFeatures: _selectListBodyFeatures,
      selectListAccessories: _selectListAccessories,
      attributeConfig: parsedConfig,
      bgColor: bg as string ?? null,
      onlyView: ov != undefined ? (ov as string).toLowerCase() === 'true' : false,
    }
  };
}