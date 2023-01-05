import {Component} from "react";
import Image from "next/image";
import AGLoading from "../components/common/ag-loading.component";
import {Clock, Vector3, WebGLInfo} from "three";
import {FrustumCulledFalse, GetBaseCameraControls} from "../utils/threejs/scene.util";
import {GetTestLights, GetAmbientLights} from "../utils/test-scene.util";
import {
  GetAccessoryListByCampaign,
  GetAnimationListByCampaign,
  GetAssetsListByCampaign,
  GetGltfModel,
  GetPartsData,
} from "../utils/importer.util";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {AttributeValues, GlobalValues, ViewModuleState} from "../enums/common.enum";
import {FirestoreParameters} from "../enums/firebase.enum";
import {AccLocationApi, AnimLocationApi, BodyPartLocationApi} from "../interfaces/api.interface";
import {
  ChangeObjectSkinColor,
  ReplaceModelAccessory,
  ReplaceModelPartOnly,
  TransformObject3dToToonMaterial
} from "../utils/model.util";
import {ExporterUtil, SaveFile} from "../utils/exporter.util";
import {GetServerSideProps} from "next";
import {
  AccessoryInfoInterface,
  BasicData,
  CampaignConfig,
  ExportInterface,
  LookAtVectors,
  PartInfoInterface
} from "../interfaces/common.interface";
import {GetParameters} from "../utils/firebase.util";
import {RandomArrayElement} from "../utils/common.util";
import FeatureSelectorComponent from "../components/selectors/featureSelector.component";
import OptionSelectorComponent from "../components/selectors/optionSelector.component";
import ColorSelectorComponent from "../components/selectors/colorSelector.component";
import {IFrameExportData, IFrameReady, SetIFrameEvents} from "../utils/iframe.util";
import {CreateAnimationMixer, SetAnimation} from "../utils/threejs/animation.util";
import {SceneInterface} from "../interfaces/scene.interface";
import {InitSceneController} from "../utils/threejs/scene.util";

export interface AvatarGeneratorProps {
  campaign?: string | null;
  baseMeshPath: string;
  campaignConfig: CampaignConfig;
  selectListBodyParts: BasicData[];
  selectListAccessories: BasicData[];
  attributeConfig: BasicData[] | null;
  // callback when data is ready to be used
  onDataLoaded?: () => void;
  bgColor?: string;
  onlyView: boolean;
}

interface AvatarGeneratorState {
  rotateCamera: boolean;
  doAnimation: boolean;
  selectedPart: string;
  selectedAcc: string;
  partList: BodyPartLocationApi[];
  accessoryList: AccLocationApi[];
  selectList: BasicData[];
  aSelectList: BasicData[];
  cameraPos: Vector3;
  cameraLookAt: Vector3;
  logs?: WebGLInfo;
  skinColor?: string;
  editModeSelected: boolean;
  featuresSelected: boolean;
  currentModule: ViewModuleState;
  loading: boolean;
  resX: number;
  resY: number;
}

export default class AvatarGenerator extends Component<AvatarGeneratorProps, AvatarGeneratorState> {
  mount: HTMLDivElement | null;
  clock: Clock;

  sc: SceneInterface;

  savedModels: Record<string, GLTF>;

  doCameraMovement: boolean = false;
  cameraTargetPosition?: Vector3;
  
  accessoryListData: Record<string, AccessoryInfoInterface>;
  partListData?: Record<string, PartInfoInterface>;
  partList?: BodyPartLocationApi[];
  accessoryList?: AccLocationApi[];
  animationList?: AnimLocationApi[];
  exportData?: ExportInterface;

  tanFOV?: number;
  windowHeight?: number;
  hasAnimation?: boolean;
  private onIFrame: boolean;

  constructor(props: AvatarGeneratorProps) {
    super(props);
    this.state = {
      doAnimation: true,
      rotateCamera: false,
      selectedPart: props.selectListBodyParts[0].id,
      selectedAcc: props.selectListAccessories[0].id,
      partList: [],
      accessoryList: [],
      selectList: props.selectListBodyParts,
      aSelectList: props.selectListAccessories,
      cameraPos: new Vector3(),
      cameraLookAt: new Vector3(),
      skinColor: 'F2A47E',// 'cf9e7c',
      editModeSelected: false,
      featuresSelected: true,
      currentModule: ViewModuleState.OnModule,
      loading: true,
      resX: 0,
      resY: 0,
    };

    this.sc = {};
    this.savedModels = {};
    this.mount = null;
    this.clock = new Clock();
    this.exportData = {attributes: []};
    this.onIFrame = false;
    this.accessoryListData = {};
  }

  async componentDidMount() {
    if (!this.props.onlyView) this.changeView();
    
    await this.avatarScene();
    
    await Promise.all([
      this.getPartList(),
      this.getAccessoryList(),
      this.getAnimationList()
    ]);
    
    await this.getPartsData();
    await this.loadPreData();
    await this.setStartAnimation();
    await this.onClickChangeSkinColor();
    
    // this.setLoading(false);
    this.setLoading(false);
    this.setLoading(false);
    // trigger event when component has all data to render
    this.props.onDataLoaded?.()

    this.setState({
      resX: window.innerWidth,
      resY: window.innerHeight
    });

    IFrameReady(this.setOnIFrame);
  }

  setLoading(newState: boolean = true) {
    this.setState({loading: newState});
  }

  setOnIFrame = () => {
    console.log('IFrame Callback: ', this.onIFrame);
    this.onIFrame = true;
    SetIFrameEvents(this.changePartFromIFrame, this.exportFromIFrame, this.changeSkinColorFromIFrame);
  }

  changePartFromIFrame = async (params?: BasicData) => {
    if(!this.onIFrame) return console.log("Not on IFrame, subscribe if you forgot!");
    if(!params) return console.log("Missing feature option!");
    
    if(params.detail && params.detail.startsWith('http')) {
      await this.changePart(`${params.id}_${params.val}_${params.detail}`, params.detail, params.val, params.id);
    }
    else {
      if(params.id.endsWith(GlobalValues.AccEnd)) {
        const accessory = this.accessoryList?.find(a => a.type === params.id && a.name === params.val);

        if(!accessory) return console.log("Accessory option not found!");
        await this.changeAccessory(accessory.id, accessory.path, accessory.name, accessory.type);
      }
      else {
        const feature = this.partList?.find(p => p.type === params.id && p.name === params.val);

        if(!feature) return console.log("Feature option not found!");
        await this.changePart(feature.id, feature.path, feature.name, feature.type);
      }
    }
  }
  
  changeSkinColorFromIFrame = (newColor?: string) => {
    return this.onClickChangeSkinColor(newColor);
  }
  
  exportFromIFrame = () => {
    return this.exportModel();
  }

  setHasAnimation = () => {
    // console.log('Animation CallBack: ', this.hasAnimation);
    this.hasAnimation = true;
  }

  async loadPreData() {
    if(this.props.campaign && this.props.campaign !== GlobalValues.BaseCampaign) {
      this.exportData?.attributes.push({id: AttributeValues.Campaign, val: this.props.campaign!});
    }

    if(this.props.attributeConfig) {
      for (const attribute of this.props.attributeConfig) {
        // Is a part
        if(this.state.selectList.some(pl => pl.id === attribute.id)) {
          const newPart = this.partList!.find(p => p.name === attribute.val && p.type === attribute.id);
          if(newPart)
            await this.changePart(newPart.id, newPart.path, newPart.name, attribute.id);
        }
        // Is an accessory
        else if(this.state.aSelectList.some(pl => pl.id === attribute.id)) {
          const newAcc = this.accessoryList!.find(p => p.name === attribute.val && p.type === attribute.id);
          if(newAcc)
            await this.changeAccessory(newAcc.id, newAcc.path, newAcc.name, attribute.id);
        }
      }
    }
    else {
      let randomFeature: BodyPartLocationApi[] = [];
      let randomAccessory: AccLocationApi[] = [];
      
      // Load random features
      for(const partType of this.state.selectList) {
        const randomPart = RandomArrayElement(this.partList!.filter(p => p.type === partType.id));
        if (randomPart)
          randomFeature.push(randomPart);
      }

      for(const accType of this.state.aSelectList) {
        const randomAcc = RandomArrayElement(this.accessoryList!.filter(a => a.type === accType.id));
        if(randomAcc)
          randomAccessory.push(randomAcc);
      }

      const modelPromises: Promise<GLTF>[] = [];
      for (const feature of randomFeature)
        modelPromises.push(this.getWearableOption(feature.id, feature.path));
      for (const acc of randomAccessory)
        modelPromises.push(this.getWearableOption(acc.id, acc.path));
      await Promise.all([...modelPromises]);

      for (const feature of randomFeature)
        await this.changePart(feature.id, feature.path, feature.name, feature.type);
      for (const acc of randomAccessory)
        await this.changeAccessory(acc.id, acc.path, acc.name, acc.type);
    }
  }

  async getPartList() {
    this.partList = await GetAssetsListByCampaign(this.props.campaign);
    const _partList = this.filterListByBodyPart(this.state.selectedPart);
    // console.log('result', this.partList);
    this.setState({ partList: _partList });
  }

  async getAccessoryList() {
    this.accessoryList = await GetAccessoryListByCampaign(this.props.campaign);
    const _accessoryList = this.filterListByAccessory(this.state.selectedAcc);
    this.setState({ accessoryList: _accessoryList });
  }

  async getAnimationList() {
    this.animationList = await GetAnimationListByCampaign(this.props.campaign);
    // console.log(this.animationList);
  }

  filterListByBodyPart(bodyPartType: string) {
    return this.partList!.filter(x => x.type === bodyPartType);
  }

  filterListByAccessory(accessoryPartType: string) {
    return this.accessoryList!.filter(x => x.type === accessoryPartType);
  }

  async getPartsData() {
    this.partListData = GetPartsData(this.sc.baseModel!.scene, this.state.selectList);
  }

  async avatarScene() {
    this.sc = InitSceneController();

    this.cameraTargetPosition = this.sc.camera!.position.clone();
    this.setState({
      cameraPos: this.cameraTargetPosition.clone()
    });

    // mount scene
    this.mount!.appendChild(this.sc.renderer!.domElement);

    // camera controls
    this.sc.controls = GetBaseCameraControls(this.sc.camera!, this.sc.renderer!.domElement);
    this.setState({
      cameraLookAt: this.sc.controls!.target.clone()
    });

    // Add test assets
    // this.scene.add(GetTestCube());
    // this.scene.add(GetTestAxis(5));

    const lights = GetTestLights();
    for(const l of lights) {
      this.sc.scene!.add(l);
    }
    const aLights = GetAmbientLights();
    for(const l of aLights) {
      this.sc.scene!.add(l);
    }

    this.sc.baseModel = await GetGltfModel(this.props.baseMeshPath);
    // console.log('Base start', this.sc.baseModel);

    this.sc.mixer = CreateAnimationMixer(this.sc.baseModel!.scene);
    await SetAnimation(this.sc.mixer, this.sc.baseModel, this.setHasAnimation);

    await TransformObject3dToToonMaterial(this.sc.baseModel.scene);
    this.sc.scene!.add(this.sc.baseModel.scene);

    // remember these initial values
    this.tanFOV = Math.tan(((Math.PI / 180) * this.sc.camera!.fov / 2));
    this.windowHeight = window.innerHeight;

    window.addEventListener( 'resize', this.onWindowResize, false );

    FrustumCulledFalse(this.sc.scene!);

    this.Animate();
  }

  onWindowResize = (event: Event) => {
    this.setState({ resX: window.innerWidth, resY: window.innerHeight });
    this.sc.camera!.aspect = window.innerWidth / window.innerHeight;

    // adjust the FOV
    this.sc.camera!.fov = (360 / Math.PI) * Math.atan(this.tanFOV! * ( window.innerHeight / this.windowHeight!));

    this.sc.camera!.updateProjectionMatrix();
    //this.camera!.lookAt(this.scene!.position);

    this.sc.renderer!.setSize(window.innerWidth, window.innerHeight);
    this.sc.renderer!.render(this.sc.scene!, this.sc.camera!);
  }

  // Animate the scene
  Animate = () => {
    requestAnimationFrame(this.Animate);

    let delta = this.clock.getDelta();
    if (this.sc.mixer && this.state.doAnimation) this.sc.mixer.update(delta);

    this.sc.controls!.update();

    if(this.sc.camera!.position.distanceTo(this.cameraTargetPosition!) < 0.1) {
      this.doCameraMovement = false;
      this.sc.controls!.autoRotate = this.state.rotateCamera;
    }

    if(this.doCameraMovement)
      this.sc.camera!.position.lerp(this.cameraTargetPosition!, delta);

    this.setState({ logs: this.sc.renderer!.info})

    this.sc.renderer!.render(this.sc.scene!, this.sc.camera!);
  }

  changeCamPosition(value: Vector3 = this.state.cameraPos.clone()) {
    this.doCameraMovement = true;
    this.sc.controls!.autoRotate = false;
    this.cameraTargetPosition = value;
  }

  changeLookAtPosition(value: Vector3 = this.state.cameraLookAt.clone()) {
    this.sc.controls!.target = value;
  }

  async onClickChangeSkinColor(newSkinColor = this.state.skinColor) {
    if(newSkinColor != undefined) {
      await ChangeObjectSkinColor(this.sc.baseModel!.scene, newSkinColor);
      this.setState({skinColor: newSkinColor});
    }
  }

  updateCameraAutoRotate = (checked: boolean) => {
    this.setState({ rotateCamera: checked });
    this.sc.controls!.autoRotate = checked;
  }

  updateDoAnimation = (checked: boolean) => {
    this.setState({ doAnimation: checked });
  }

  async onCategoryChange(value: string) {
    const _partList = this.filterListByBodyPart(value);
    this.setState({ partList: _partList, selectedPart: value });
    this.setFeatureCamPosition(value, this.props.campaignConfig.partsCamPos);
  }

  async onAccessoryChange(value: string) {
    const _accessoryList = this.filterListByAccessory(value);
    this.setState({ accessoryList: _accessoryList, selectedAcc: value });
    this.setFeatureCamPosition(value, this.props.campaignConfig.accCamPos);
  }

  setFeatureCamPosition(index: string, posLocation?: Record<string, LookAtVectors>) {
    const confRef = posLocation ? posLocation[index] : undefined;
    if(confRef) {
      this.changeCamPosition(new Vector3(confRef.pos?.x, confRef.pos?.y, confRef.pos?.z));
      this.changeLookAtPosition(new Vector3(confRef.lookAt?.x, confRef.lookAt?.y, confRef.lookAt?.z));
    }
  }
  
  async getWearableOption(id: string, partPath: string) {
    let replaceModel: GLTF;
    if(this.savedModels[id]) {
      replaceModel = this.savedModels[id];
    } else {
      replaceModel = await GetGltfModel(partPath);
      this.savedModels[id] = replaceModel;
    }
    
    return replaceModel;
  }

  async changePart(id: string, partPath: string, name: string, selectedPart: string = this.state.selectedPart) {
    const replaceModel = await this.getWearableOption(id, partPath);
    
    await ReplaceModelPartOnly(this.sc.baseModel!.scene.children[0], replaceModel, this.partListData![selectedPart], this.state.selectList.find(sl => sl.id === selectedPart), this.state.skinColor);
    await this.getPartsData();
    this.addReplaceAttribute(selectedPart, name);
  }

  async changeAccessory(id: string, path: string, name: string, selectedAcc: string = this.state.selectedAcc) {
    const replaceModel = await this.getWearableOption(id, path);

    await ReplaceModelAccessory(this.sc.baseModel!.scene.children[0], replaceModel, this.accessoryListData, selectedAcc);
    this.addReplaceAttribute(selectedAcc, name);
  }

  addReplaceAttribute(addId: string, addValue: string) {
    if(this.exportData?.attributes.some(x => x.id === addId)) {
      const oldAttribute = this.exportData!.attributes.find(x => x.id === addId);
      oldAttribute!.val = addValue;
      return;
    }

    this.exportData?.attributes.push({id: addId, val: addValue});
  }

  async takeExportPicture() {
    const mimeType = 'image/png';
    this.sc.renderer!.domElement.toBlob(blob => {
      if(blob) {
        this.exportData!.picture = blob;
      }
    }, mimeType);
  }

  async exportModel() {
    await this.takeExportPicture();
    this.exportData!.attributesBase64 = window.btoa(JSON.stringify(this.exportData?.attributes));
    this.exportData!.model = await ExporterUtil.ExportModelGlb(this.sc.baseModel!);
    if(this.onIFrame) {
      IFrameExportData(this.exportData!);
    }
    else {
      await SaveFile(this.exportData!.model, 'model.glb');
      await SaveFile(this.exportData!.picture!, 'picture.png');
    }
  }

  optionListAccessories() {
    return this.state.aSelectList.map((x) => {
      return <option value={x.id} key={x.id}>{x.id}</option>
    });
  }

  accessorySelectList() {
    return this.state.accessoryList.map((x) => {
      return (
        <div className="flex justify-center py-2" key={x.id}>
          <button
            className="font-bold py-2 px-4 mx-2 w-full rounded bg-orange-400 text-white"
            onClick={() => this.changeAccessory(x.id, x.path, x.name)}>
            {x.name}
          </button>
        </div>
      );
    });
  }

  changeView() {
    // const parent = this.mount?.parentNode as HTMLElement;
    if (this.state.editModeSelected) {
      // parent!.classList.add('!w-full');
      // parent!.classList.add('!h-full');
      // parent!.classList.remove('rounded-b-[180px]');
      this.setState({editModeSelected: false, currentModule: ViewModuleState.SwitchingModule});
    } else {
      // parent!.classList.remove('!w-full');
      // parent!.classList.remove('!h-full');
      // parent!.classList.add('rounded-b-[180px]');
      setTimeout(() => {
        this.setState({editModeSelected: true, currentModule: ViewModuleState.SwitchingModule});
      }, 500);
    }
  }

  changeEditSelection(value: boolean) {
    this.setState({featuresSelected: value});
  }

  render() {
    return (
      <>
        {this.renderEditMode()}
      </>
    );
  }

  private renderEditMode() {
    return (
      <>
        <AGLoading loading={this.state.loading} bgColor={this.props.bgColor} />
        {/* CANVAS WRAPPER */}
        <div className="fixed left-[50%] translate-x-[-50%] flex justify-center items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
          {/* CANVAS BACKGROUND */}
          <div style={{backgroundColor: `#${this.props.bgColor ?? '272727'}`}} className="w-full h-screen absolute" />
          {/* CANVAS */}
          <div className="relative h-full" ref={ref => this.mount = ref} />
        </div>
        {!this.props.onlyView &&
            <div onClick={() => this.changeView()}
                 className="z-10 fixed top-4 right-4 bg-slate-100 border-2 border-slate-50 rounded-[4px] drop-shadow-md flex items-center justify-center px-2">
              <div className="m-2">
                {
                  this.state.editModeSelected ?
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
              <div className="mr-2 text-xs">{this.state.editModeSelected ? 'NEXT':'EDIT'}</div>
            </div>
        }
        {this.state.editModeSelected ?
          <>
            <div className="fixed bottom-0 left-0 w-screen">
              <div className="w-full">
                {
                  this.state.featuresSelected &&
                  <OptionSelectorComponent list={this.state.partList} activeOption={this.exportData?.attributes.find(o => o.id === this.state.selectedPart)} handleClick={(id: string, path: string, name: string) => this.changePart(id, path, name)}/>
                }
              </div>
              <div className="w-full bg-slate-100 flex">
                <div className="w-[calc(100%_-_60px)]">
                  {
                    this.state.featuresSelected ?
                    <FeatureSelectorComponent list={this.state.selectList} activeFeature={this.state.selectedPart} handleClick={(value:string) => this.onCategoryChange(value)}/>
                    :
                    <ColorSelectorComponent list={['F6C89B','E8A36F', '9F5835', 'F2A47E', 'C67E42']} activeColor={this.state.skinColor} handleClick={(value:string) => this.onClickChangeSkinColor(value)}/>
                  }
                </div>
                <div className="w-[60px] pt-3" onClick={() => this.changeEditSelection(!this.state.featuresSelected)}>
                  <div className="border-l border-slate-400 text-center flex flex-col items-center">
                    <div className={"rounded-md w-[40px] h-[40px] flex justify-center items-center"}>
                      {
                        this.state.featuresSelected ?
                        <Image src='/resources/icos/buttons/head.svg' width={25} height={25} alt={'Color button'} className='opacity-70'/>
                        :
                        <Image src='/resources/icos/features/features.svg' width={30} height={30} alt={'Color button'} className='opacity-70'/>
                      }
                    </div>
                    <p className='text-[10px] pt-1 opacity-50 w-[40px]'>{this.state.featuresSelected ? 'Skin':'Features'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
          :<>
            {!this.props.onlyView &&
              <div onClick={() => this.exportModel()}
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
          // <>
          //   <CategorySelectorComponent close={!this.state.featuresSelected} list={this.state.selectList} activedPart={this.state.selectedPart} handleClick={(value:string) => this.onCategoryChange(value)} handleClick2={(value:boolean) => this.changeEditSelection(value)} />
          //   <AccessorySelectorComponent close={this.state.featuresSelected} list={this.state.aSelectList} activedPart={this.state.selectedAcc} handleClick={(value:string) => this.onAccessoryChange(value)} handleClick2={(value:boolean) => this.changeEditSelection(value)} />
          //   {
          //     this.state.featuresSelected ?
          //     <CategoryChildrenComponent list={this.state.partList} handleClick={(id: string, path: string, name: string) => this.changePart(id, path, name)}/>
          //     : <AccessoryChildrenComponent list={this.state.accessoryList} handleClick={(id: string, path: string, name: string) => this.changeAccessory(id, path, name)}/>
          //   }
          // </>
          // :<>
          //   {!this.props.onlyView &&
          //     <div onClick={() => this.exportModel()}
          //     className="z-10 fixed bottom-28 right-4 w-24 h-12 bg-gray-200 border-2 border-gray-100 rounded-[6px] drop-shadow-md flex items-center justify-center px-14">
          //       <div className="m-2">
          //         <svg version="1.1" id="Layer_3" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={'1rem'}
	        //         viewBox="0 0 460 460">
          //           <path d="M427.137,0C408.93,0,51.379,0,32.865,0C14.743,0,0,14.743,0,32.865v394.272c0,18.122,14.743,32.865,32.865,32.865
          //             c0,0,374.895,0,394.272,0c18.122,0,32.865-14.743,32.865-32.865V32.865C460.001,14.743,445.258,0,427.137,0z M245.812,30h50.995
          //             v54.466h-50.995V30z M107.198,30h108.615v69.466c0,8.284,6.716,15,15,15h80.995c8.284,0,15-6.716,15-15V30h26.377v119.636H107.198
          //             V30z M107.007,430.001V308.673h245.986v121.328H107.007z M430.002,427.137L430.002,427.137c-0.001,1.58-1.286,2.865-2.866,2.865
          //             h-44.143V293.673c0-8.284-6.716-15-15-15H92.007c-8.284,0-15,6.716-15,15v136.328H32.865c-1.58,0-2.865-1.285-2.865-2.865V32.865
          //             C30,31.285,31.285,30,32.865,30h44.333v134.636c0,8.284,6.716,15,15,15h275.986c8.284,0,15-6.716,15-15V30h43.953
          //             c1.58,0,2.865,1.285,2.865,2.865V427.137z"/>
          //         </svg>
          //       </div>
          //       <div className="mr-2">SAVE</div>
          //     </div>
          //   }
          // </>
        }
      </>
    );
  }

  componentDidUpdate(prevProps: Readonly<AvatarGeneratorProps>, prevState: Readonly<AvatarGeneratorState>, snapshot?: any) {
    if(this.mount && this.state.currentModule !== ViewModuleState.OnModule) {
      this.mount!.appendChild(this.sc.renderer!.domElement);
      this.setState({currentModule: ViewModuleState.OnModule});
    }
  }
  
  private async setStartAnimation() {
    const startAnimation = this.animationList?.at(0);
    if(startAnimation == undefined) return;
    if(this.sc.mixer == undefined) return;
    
    await SetAnimation(this.sc.mixer, startAnimation.path);
  }
}

export const getServerSideProps: GetServerSideProps<AvatarGeneratorProps> = async (context) => {
  const GV = GlobalValues;
  // Get subdomain
  let subdomain: string | undefined;
  let parsedConfig: BasicData[] | null = null;
  const { campaign, config, bg, ov } = context.query;
  if(campaign)
    subdomain = campaign as string;
  else
    subdomain = context.req.headers.host?.split(".")[0];

  if(config) {
    parsedConfig = JSON.parse(Buffer.from(config as string, 'base64').toString('ascii'));
    if(parsedConfig?.some(x => x.id === AttributeValues.Campaign)) {
      const configCampaign = parsedConfig?.find(x => x.id === AttributeValues.Campaign);
      subdomain = configCampaign!.val;
    }
  }

  const campaigns = (await GetParameters<string[]>(FirestoreParameters.Campaigns))[0];
  const isCampaign = campaigns.some(c => c === subdomain);

  let _baseMeshPath: string;
  let _campaignConfig: CampaignConfig;
  let _selectListBodyParts: BasicData[];
  let _selectListAccessories: BasicData[];

  if(isCampaign) {
    _baseMeshPath = `base_mesh/${subdomain}.glb`;
    const result = await GetParameters(subdomain!, subdomain! + GV.Acc, subdomain! + GV.Config);
    _selectListBodyParts = result[0] as BasicData[];
    _selectListAccessories = result[1] as BasicData[];
    _campaignConfig = result[2] as CampaignConfig;
  }
  else {
    _baseMeshPath = `base_mesh/${GV.BaseCampaign}.glb`;
    const result = await GetParameters(GV.BaseCampaign, GV.BaseCampaign + GV.Acc, GV.BaseCampaign + GV.Config);
    _selectListBodyParts = result[0] as BasicData[];
    _selectListAccessories = result[1] as BasicData[];
    _campaignConfig = result[2] as CampaignConfig;
  }

  return {
    props: {
      campaign: isCampaign ? subdomain : null,
      baseMeshPath: _baseMeshPath,
      campaignConfig: _campaignConfig ?? {},
      selectListBodyParts: _selectListBodyParts,
      selectListAccessories: _selectListAccessories,
      attributeConfig: parsedConfig,
      bgColor: bg as string ?? null,
      onlyView: ov != undefined ? (ov as string).toLowerCase() === 'true' : false,
    }
  };
}