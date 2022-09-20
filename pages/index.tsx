import {Component} from "react";
import Image from "next/image";
import Head from "next/head";
import AGLoading from "../components/common/ag-loading.component";
import {Clock, Vector3, WebGLInfo} from "three";
import {FrustumCulledFalse, GetBaseCameraControls} from "../utils/threejs/scene.util";
import {GetTestLights, GetAmbientLights} from "../utils/test-scene.util";
import {
  GetAccessoryBones,
  GetAccessoryListByCampaign,
  GetAnimationListByCampaign,
  GetAssetsListByCampaign,
  GetPartsData,
  ImporterUtil
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
import {LogComponent} from "../components/log.component";
import {CategorySelectorComponent} from "../components/categorySelector.component";
import {CategoryChildrenComponent} from "../components/categoryChildren.component";
import {IFrameExportData, IFrameReady} from "../utils/iframe.util";
import {CreateAnimationMixer, SetAnimation} from "../utils/threejs/animation.util";
import {SceneInterface} from "../interfaces/scene.interface";
import {InitSceneController} from "../utils/threejs/scene.util";

interface AvatarGeneratorProps {
  campaign?: string | null;
  baseMeshPath: string;
  campaignConfig: CampaignConfig;
  selectListBodyParts: BasicData[];
  selectListAccessories: BasicData[];
  attributeConfig: BasicData[] | null;
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
  savedModels: Record<string, GLTF>;
  logs?: WebGLInfo;
  skinColor?: string;
  editModeSelected: boolean;
  currentModule: ViewModuleState;
  loading: boolean;
  resX: number;
  resY: number;
}

export default class AvatarGenerator extends Component<AvatarGeneratorProps, AvatarGeneratorState> {
  mount: HTMLDivElement | null;
  clock: Clock;

  sc: SceneInterface;

  // scene?: Scene;
  // baseModel?: GLTF;
  // camera?: PerspectiveCamera;
  // renderer?: WebGLRenderer;
  // mixer?: AnimationMixer;
  // controls?: OrbitControls;

  doCameraMovement: boolean = false;
  cameraTargetPosition?: Vector3;

  accessoryBonesData?: Record<string, AccessoryInfoInterface>;
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
      skinColor: 'cf9e7c',
      savedModels: {},
      editModeSelected: true,
      currentModule: ViewModuleState.OnModule,
      loading: false,
      resX: 0,
      resY: 0,
    };

    this.sc = {};
    this.mount = null;
    this.clock = new Clock();
    this.exportData = {attributes: []};
    this.onIFrame = false;
  }

  async componentDidMount() {
    this.setLoading();
    await this.avatarScene();
    
    await Promise.all([
      this.getPartList(),
      this.getAccessoryList(),
      this.getAnimationList()
    ]);
    
    await this.getAccessoryBones();
    await this.getPartsData();
    await this.onClickChangeSkinColor();
    
    await this.loadPreData();
    this.setLoading(false);

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
  }

  setHasAnimation = () => {
    console.log('Animation CallBack: ', this.hasAnimation);
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
      const promises: Promise<void>[] = [];
      
      // Load random features
      for(const partType of this.state.selectList) {
        const randomPart = RandomArrayElement(this.partList!.filter(p => p.type === partType.id));
        if (randomPart)
          promises.push(this.changePart(randomPart.id, randomPart.path, randomPart.name, partType.id));
      }

      for(const accType of this.state.aSelectList) {
        const randomAcc = RandomArrayElement(this.accessoryList!.filter(a => a.type === accType.id));
        if(randomAcc)
          promises.push(this.changeAccessory(randomAcc.id, randomAcc.path, randomAcc.name, accType.id));
      }
      
      await Promise.all([...promises]);
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
    console.log(this.animationList);
  }

  filterListByBodyPart(bodyPartType: string) {
    return this.partList!.filter(x => x.type === bodyPartType);
  }

  filterListByAccessory(accessoryPartType: string) {
    return this.accessoryList!.filter(x => x.type === accessoryPartType);
  }

  async getPartsData() {
    this.partListData = GetPartsData(this.sc.baseModel!.scene, this.state.selectList);
    // console.log(this.partListData);
  }

  async getAccessoryBones() {
    this.accessoryBonesData = GetAccessoryBones(this.sc.baseModel!.scene, this.state.aSelectList);
    // console.log('base', this.accessoryBonesData);
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

    this.sc.baseModel = await ImporterUtil.FirebaseGltfModel(this.props.baseMeshPath);
    console.log('Base start', this.sc.baseModel);

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

  async onClickChangeSkinColor() {
    if(this.state.skinColor)
      await ChangeObjectSkinColor(this.sc.baseModel!.scene, this.state.skinColor);
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

  async changePart(id: string, partPath: string, name: string, selectedPart: string = this.state.selectedPart) {
    let replaceModel: GLTF;
    if(this.state.savedModels[id]) {
      replaceModel = this.state.savedModels[id];
    } else {
      replaceModel = await ImporterUtil.FirebaseGltfModel(partPath);
      const _savedModels = {...this.state.savedModels};
      _savedModels[id] = replaceModel;
      this.setState({ savedModels: _savedModels });
    }

    await ReplaceModelPartOnly(this.sc.baseModel!.scene.children[0], replaceModel, this.partListData![selectedPart], this.state.selectList.find(sl => sl.id === selectedPart), this.state.skinColor);
    await this.getPartsData();
    // FrustumCulledFalse(this.sc.scene!);
    this.addReplaceAttribute(selectedPart, name);
  }

  async changeAccessory(id: string, path: string, name: string, selectedAcc: string = this.state.selectedAcc) {
    let replaceModel: GLTF;
    if(this.state.savedModels[id]) {
      replaceModel = this.state.savedModels[id];
    } else {
      replaceModel = await ImporterUtil.FirebaseGltfModel(path);
      const _savedModels = {...this.state.savedModels};
      _savedModels[id] = replaceModel;
      this.setState({ savedModels: _savedModels });
    }

    await ReplaceModelAccessory(this.accessoryBonesData!, selectedAcc, replaceModel);
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
    console.log(this.exportData);
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
    const parent = this.mount?.parentNode as HTMLElement;
    if (this.state.editModeSelected) {
      parent!.classList.add('!w-full');
      parent!.classList.add('!h-full');
      parent!.classList.remove('rounded-b-[180px]');
      this.setState({editModeSelected: false, currentModule: ViewModuleState.SwitchingModule});
    } else {
      parent!.classList.remove('!w-full');
      parent!.classList.remove('!h-full');
      parent!.classList.add('rounded-b-[180px]');
      setTimeout(() => {
        this.setState({editModeSelected: true, currentModule: ViewModuleState.SwitchingModule});
      }, 500);
    }
  }

  render() {
    return (
      <>
        {this.renderEditMode()}
        <LogComponent logs={this.state.logs} resX={this.state.resX} resY={this.state.resY}/>
      </>
    );
  }

  private renderEditMode() {
    return (
      <>
        <Head>
          <title>ThreeJs Example</title>
        </Head>
        <div className="fixed w-[360px] h-4/5 left-[50%] translate-x-[-50%] flex justify-center items-start rounded-b-[180px] overflow-hidden transition-width transition-height duration-300 ease-in-out">
          <div className="bg-[#272727] w-full h-screen absolute"></div>
          <div className="relative h-full" ref={ref => this.mount = ref} />
        </div>
        <div className="fixed left-0 top-0 w-full h-screen bg-slate-600 bg-opacity-50 p-2 hover:overflow-y-auto hidden">
          <div className="mb-2 flex bg-slate-400">
            <input className="mt-1.5 mx-2" type="checkbox" checked={this.state.rotateCamera} onChange={e => this.updateCameraAutoRotate(e.target.checked)} />
            <p>Rotate camera</p>
          </div>
          {
            this.hasAnimation ?
              <div className="mb-2 flex bg-slate-400">
                <input className="mt-1.5 mx-2" type="checkbox" checked={this.state.doAnimation}
                       onChange={e => this.updateDoAnimation(e.target.checked)}/>
                <p>Do Animation</p>
              </div>
              : ''
          }
          <div className="mb-2 w-full bg-slate-400">
            <div className="flex pt-2 mb-2 justify-evenly">
              <div className="flex justify-center">
                <p>X:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraPos.x} onChange={(e) => this.setState({cameraPos: new Vector3(Number(e.target.value), this.state.cameraPos.y, this.state.cameraPos.z)})} />
              </div>
              <div className="flex justify-center">
                <p>Y:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraPos.y} onChange={(e) => this.setState({cameraPos: new Vector3(this.state.cameraPos.x, Number(e.target.value), this.state.cameraPos.z)})} />
              </div>
              <div className="flex justify-center">
                <p>Z:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraPos.z} onChange={(e) => this.setState({cameraPos: new Vector3(this.state.cameraPos.x, this.state.cameraPos.y, Number(e.target.value))})} />
              </div>
            </div>
            <div className="flex justify-center pb-2">
              <button className="font-bold py-2 px-4 rounded bg-blue-500 text-white" onClick={() => this.changeCamPosition()}>Change CamPosition</button>
            </div>
          </div>
          <div className="mb-2 w-full bg-slate-400">
            <div className="flex pt-2 mb-2 justify-evenly">
              <div className="flex justify-center">
                <p>X:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraLookAt.x} onChange={(e) => this.setState({cameraLookAt: new Vector3(Number(e.target.value), this.state.cameraLookAt.y, this.state.cameraLookAt.z)})} />
              </div>
              <div className="flex justify-center">
                <p>Y:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraLookAt.y} onChange={(e) => this.setState({cameraLookAt: new Vector3(this.state.cameraLookAt.x, Number(e.target.value), this.state.cameraLookAt.z)})} />
              </div>
              <div className="flex justify-center">
                <p>Z:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraLookAt.z} onChange={(e) => this.setState({cameraLookAt: new Vector3(this.state.cameraLookAt.x, this.state.cameraLookAt.y, Number(e.target.value))})} />
              </div>
            </div>
            <div className="flex justify-center pb-2">
              <button className="font-bold py-2 px-4 rounded bg-blue-500 text-white" onClick={() => this.changeLookAtPosition()}>Change CamLookAt</button>
            </div>
          </div>
          {
            this.accessoryList && this.accessoryList?.length > 0 ?
              <div className="mb-2 bg-slate-400">
                <div className="m-2">
                  <p className="font-bold text-cyan-900">Accessories</p>
                  <select value={this.state.selectedAcc} className="w-full my-2"
                          onChange={(e) => this.onAccessoryChange(e.target.value)}>
                    {this.optionListAccessories()}
                  </select>
                </div>
              </div>
              : ''
          }
          <div className="mb-2 bg-slate-400">
            {this.accessorySelectList()}
          </div>
          {
            this.props.campaign === 'decentraland' ?
              <div className="mb-2 w-full bg-slate-400">
                <div className="flex justify-center py-2">
                  <p>#</p>
                  <input className="ml-0.5 w-3/6 rounded pl-0.5" type="text" value={this.state.skinColor || ''}
                         onChange={(e) => this.setState({skinColor: e.target.value})}/>
                </div>
                <div className="flex justify-center pb-2">
                  <button className="font-bold py-2 px-4 rounded bg-blue-500 text-white"
                          onClick={() => this.onClickChangeSkinColor()}>Change SkinColor
                  </button>
                </div>
              </div>
              : ''
          }
          <div className="mb-2 bg-slate-400">
            <div className="flex justify-center py-2">
              <button
                className="font-bold py-2 px-4 mx-2 w-full rounded bg-emerald-600 text-white"
                onClick={() => this.exportModel()}>
                Export Model
              </button>
            </div>
          </div>
        </div>
        <div onClick={() => {this.changeView()}} className="fixed top-4 left-4 w-12 h-12 bg-gray-200 border-2 border-gray-100 rounded-[6px] drop-shadow-md flex flex-col items-center justify-center">
          {this.state.editModeSelected ?
            <Image src={'/resources/icos/buttons/ViewMode.svg'} width={30} height={30} alt={'view mode'}/>
            :<Image src={'/resources/icos/buttons/EditMode.svg'} width={30} height={30} alt={'edit mode'}/>
          }
        </div>
        {this.state.editModeSelected ?
          <>
            <CategorySelectorComponent list={this.state.selectList} activedPart={this.state.selectedPart} handleClick={(value:string) => this.onCategoryChange(value)}/>
            <CategoryChildrenComponent list={this.state.partList} handleClick={(id: string, path: string, name: string) => this.changePart(id, path, name)}/>
          </>
          :<>
            <div onClick={() => this.exportModel()} className="fixed top-20 left-4 w-12 h-12 bg-gray-200 border-2 border-gray-100 rounded-[6px] drop-shadow-md flex flex-col items-center justify-center">
              <Image src={'/resources/icos/buttons/Mint.svg'} width={30} height={30} alt={'minting'}/>
            </div>
          </>
        }
        <AGLoading loading={this.state.loading} />
      </>
    );
  }

  componentDidUpdate(prevProps: Readonly<AvatarGeneratorProps>, prevState: Readonly<AvatarGeneratorState>, snapshot?: any) {
    if(this.mount && this.state.currentModule !== ViewModuleState.OnModule) {
      this.mount!.appendChild(this.sc.renderer!.domElement);
      this.setState({currentModule: ViewModuleState.OnModule});
    }
  }
}

export const getServerSideProps: GetServerSideProps<AvatarGeneratorProps> = async (context) => {
  const GV = GlobalValues;
  // Get subdomain
  let subdomain: string | undefined;
  let parsedConfig: BasicData[] | null = null;
  const { campaign, config } = context.query;
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
      attributeConfig: parsedConfig
    }
  };
}