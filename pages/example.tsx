import {Component} from "react";
import {
  AnimationMixer,
  Clock,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SkinnedMesh,
  Vector3,
  WebGLInfo,
  WebGLRenderer
} from "three";
import {
  FrustumCulledFalse,
  GetBaseCamera,
  GetBaseCameraControls,
  GetBaseRenderer,
  GetBaseScene
} from "../utils/scene.util";
import {GetTestLights, GetAmbientLights} from "../utils/test-scene.util";
import {
  GetAccessoryBones,
  GetAccessoryListByCampaign,
  GetAssetsListByCampaign,
  GetPartsData,
  ImporterUtil
} from "../utils/importer.util";
import Head from "next/head";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {AttributeValues, GlobalValues, ViewModuleState} from "../enums/common.enum";
import {FirestoreParameters} from "../enums/firebase.enum";
import {AccLocationApi, BodyPartLocationApi} from "../interfaces/api.interface";
import {ReplaceModelAccessory, ReplaceModelPartOnly, TransformObject3dToToonMaterial} from "../utils/model.util";
import {ExporterUtil} from "../utils/exporter.util";
import {GetServerSideProps} from "next";
import {
  AccessoryInfoInterface,
  BasicData,
  CampaignConfig,
  ExportInterface, LookAtVectors,
  PartInfoInterface
} from "../interfaces/common.interface";
import {FirebaseUtil} from "../utils/firebase.util";
import AGLoading from "../components/ag-loading.component";
import {RandomArrayElement} from "../utils/common.util";
import { LogComponent } from "../components/log.component";
import { CategorySelectorComponent } from "../components/categorySelector.component";
import { CategoryChildrenComponent } from "../components/categoryChildren.component";

interface ExampleProps {
  campaign?: string | null;
  baseMeshPath: string;
  campaignConfig: CampaignConfig;
  selectListBodyParts: BasicData[];
  selectListAccessories: BasicData[];
  attributeConfig: BasicData[] | null;
}

interface ExampleState {
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
  skinColor: string;
  editModeSelected: boolean;
  currentModule: ViewModuleState;
  loading: boolean;
  resX: number;
  resY: number;
}

export default class Example extends Component<ExampleProps, ExampleState> {
  mount: HTMLDivElement | null;
  clock: Clock;
  
  scene?: Scene;
  baseModel?: GLTF;
  camera?: PerspectiveCamera;
  renderer?: WebGLRenderer;
  mixer?: AnimationMixer;
  controls?: OrbitControls;

  doCameraMovement: boolean = false;
  cameraTargetPosition?: Vector3;
  
  accessoryBonesData?: Record<string, AccessoryInfoInterface>;
  partListData?: Record<string, PartInfoInterface>;
  partList?: BodyPartLocationApi[];
  accessoryList?: AccLocationApi[];
  exportData?: ExportInterface;
  
  tanFOV?: number;
  windowHeight?: number;
  hasAnimation?: boolean;
  private onIFrame: boolean;
  
  constructor(props: ExampleProps) {
    super(props);
    this.state = {
      doAnimation: false,
      rotateCamera: false,
      selectedPart: props.selectListBodyParts[0].id,
      selectedAcc: props.selectListAccessories[0].id,
      partList: [],
      accessoryList: [],
      selectList: props.selectListBodyParts,
      aSelectList: props.selectListAccessories,
      cameraPos: new Vector3(),
      cameraLookAt: new Vector3(),
      savedModels: {},
      skinColor: '',
      editModeSelected: true,
      currentModule: ViewModuleState.OnModule,
      loading: false,
      resX: 0,
      resY: 0,
    };
    
    this.mount = null;
    this.clock = new Clock();
    this.exportData = {attributes: []};
    this.onIFrame = false;
  }
  
  async componentDidMount() {
    this.setLoading();
    await this.avatarScene();
    await this.getPartList();
    await this.getAccessoryList();
    await this.getAccessoryBones();
    await this.getPartsData();
    await this.loadPreData();
    this.setLoading(false);

    this.setState({resX: window.innerWidth});
    this.setState({resY: window.innerHeight});
    
    // IFrame impl
    this.tellParentIAmReady();
  }
  
  setLoading(newState: boolean = true) {
    this.setState({loading: newState});
  }

  tellParentIAmReady() {
    window.parent.postMessage({source: "avatar-generator", eventName: 'ready'}, '*');
    window.addEventListener("message", ({data, source}) => {
      const { target, type } = data;
      if(target === 'avatar-generator' && type === 'subscribe')
        this.onIFrame = true;
    });
  }
  
  async loadPreData() {
    if(this.props.campaign && this.props.campaign !== GlobalValues.BaseCampaign) {
      this.exportData?.attributes.push({id: AttributeValues.Campaign, value: this.props.campaign!});
    }

    if(this.props.attributeConfig) {
      for (const attribute of this.props.attributeConfig) {
        // Is a part
        if(this.state.selectList.some(pl => pl.id === attribute.id)) {
          const newPart = this.partList!.find(p => p.name === attribute.value);
          if(newPart)
            await this.changePart(newPart.id, newPart.path, newPart.name, attribute.id);
        }
        // Is an accessory
        else if(this.state.aSelectList.some(pl => pl.id === attribute.id)) {
          const newAcc = this.accessoryList!.find(p => p.name === attribute.value);
          if(newAcc)
            await this.changeAccessory(newAcc.id, newAcc.path, newAcc.name, attribute.id);
        }
      }
    }
    else {
      // Load random features
      for(const partType of this.state.selectList) {
        const randomPart = RandomArrayElement(this.partList!.filter(p => p.type === partType.id));
        if (randomPart)
          await this.changePart(randomPart.id, randomPart.path, randomPart.name, partType.id);
      }
      
      for(const accType of this.state.aSelectList) {
        const randomAcc = RandomArrayElement(this.accessoryList!.filter(a => a.type === accType.id));
        if(randomAcc)
          await this.changeAccessory(randomAcc.id, randomAcc.path, randomAcc.name, accType.id);
      }
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

  filterListByBodyPart(bodyPartType: string) {
    return this.partList!.filter(x => x.type === bodyPartType);
  }

  filterListByAccessory(accessoryPartType: string) {
    return this.accessoryList!.filter(x => x.type === accessoryPartType);
  }
  
  async getPartsData() {
    this.partListData = GetPartsData(this.baseModel!.scene, this.state.selectList);
    console.log(this.partListData);
  }
  
  async getAccessoryBones() {
    this.accessoryBonesData = GetAccessoryBones(this.baseModel!.scene, this.state.aSelectList);
    console.log('base', this.accessoryBonesData);
  }
  
  async avatarScene() {
    this.scene = GetBaseScene();
    this.camera = GetBaseCamera();
    this.renderer = GetBaseRenderer();
    
    this.cameraTargetPosition = this.camera.position.clone();
    this.setState({
      cameraPos: this.cameraTargetPosition.clone()
    });

    // mount scene
    this.mount!.appendChild(this.renderer.domElement);

    // camera controls
    this.controls = GetBaseCameraControls(this.camera, this.renderer.domElement);
    this.setState({
      cameraLookAt: this.controls.target.clone()
    });

    // Add test assets
    // this.scene.add(GetTestCube());
    // this.scene.add(GetTestAxis(5));

    const lights = GetTestLights();
    for(const l of lights) {
      this.scene.add(l);
    }
    const aLights = GetAmbientLights();
    for(const l of aLights) {
      this.scene.add(l);
    }

    this.baseModel = await ImporterUtil.FirebaseGltfModel(this.props.baseMeshPath);
    console.log('base', this.baseModel);
    
    this.mixer = new AnimationMixer(this.baseModel.scene);

    this.baseModel.animations.forEach((clip) => {
      if(this.mixer) {
        this.mixer.clipAction(clip).play();
        this.hasAnimation = true;
      }
    });
    
    // Remove if want basemesh on toonMaterial
    // await TransformObject3dToToonMaterial(this.baseModel.scene);
    this.scene.add(this.baseModel.scene);

    // remember these initial values
    this.tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov / 2));
    this.windowHeight = window.innerHeight;

    window.addEventListener( 'resize', this.onWindowResize, false );
    
    FrustumCulledFalse(this.scene);

    this.Animate();
  }

  onWindowResize = (event: Event) => {
    this.setState({resX: window.innerWidth});
    this.setState({resY: window.innerHeight});
    this.camera!.aspect = window.innerWidth / window.innerHeight;
    
    // adjust the FOV
    this.camera!.fov = (360 / Math.PI) * Math.atan(this.tanFOV! * ( window.innerHeight / this.windowHeight!));

    this.camera!.updateProjectionMatrix();
    //this.camera!.lookAt(this.scene!.position);

    this.renderer!.setSize(window.innerWidth, window.innerHeight);
    this.renderer!.render(this.scene!, this.camera!);
  }
  
  // Animate the scene
  Animate = () => {
    requestAnimationFrame(this.Animate);

    let delta = this.clock.getDelta();
    if (this.mixer && this.state.doAnimation) this.mixer.update(delta);
    
    this.controls!.update();
    
    if(this.camera!.position.distanceTo(this.cameraTargetPosition!) < 0.1) {
      this.doCameraMovement = false;
      this.controls!.autoRotate = this.state.rotateCamera;
    }
    
    if(this.doCameraMovement)
      this.camera!.position.lerp(this.cameraTargetPosition!, delta);

    this.setState({ logs: this.renderer!.info})
    
    this.renderer!.render(this.scene!, this.camera!);
  }
  
  changeCamPosition(value: Vector3 = this.state.cameraPos.clone()) {
    this.doCameraMovement = true;
    this.controls!.autoRotate = false;
    this.cameraTargetPosition = value;
  }
  
  changeLookAtPosition(value: Vector3 = this.state.cameraLookAt.clone()) {
    this.controls!.target = value;
  }

  onClickChangeSkinColor = () => {
    this.baseModel!.scene.traverse((object) => {
      const objectRef = object as SkinnedMesh;
      if(objectRef.isSkinnedMesh && (objectRef.material as MeshStandardMaterial).name === 'AvatarSkin_MAT') {
        (objectRef.material as MeshStandardMaterial).color.set(`#${this.state.skinColor}`);
      }
    });
  }
  
  updateCameraAutoRotate = (checked: boolean) => {
    this.setState({ rotateCamera: checked });
    this.controls!.autoRotate = checked;
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
    
    await ReplaceModelPartOnly(this.baseModel!.scene.children[0], replaceModel, this.partListData![selectedPart], this.state.selectList.find(sl => sl.id === selectedPart));
    await this.getPartsData();
    FrustumCulledFalse(this.scene!);
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
      oldAttribute!.value = addValue;
      return;
    }
    
    this.exportData?.attributes.push({id: addId, value: addValue});
  }
  
  async exportModel() {
    this.exportData!.attributesBase64 = window.btoa(JSON.stringify(this.exportData?.attributes));
    this.exportData!.model = new Blob([await ExporterUtil.ExportModelGlb(this.baseModel!) as ArrayBuffer], { type: 'application/octet-stream' });
    console.log(this.exportData);
    if(this.onIFrame)
      window.parent.postMessage({source: 'avatar-generator', eventName: 'exported', data: this.exportData }, '*');
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
    console.log("edit mode? ", this.state.editModeSelected);
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
          <div className="bg-[#56AADC] w-full h-screen absolute"></div>
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
                  <input className="ml-0.5 w-3/6 rounded pl-0.5" type="text" value={this.state.skinColor}
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
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path className="fill-gray-600" d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"/>
            </svg>
          </div>
        </div>
        {this.state.editModeSelected &&
        <>
          <CategorySelectorComponent list={this.state.selectList} handleClick={(value:string) => this.onCategoryChange(value)}/>
          <CategoryChildrenComponent list={this.state.partList} handleClick={(id: string, path: string, name: string) => this.changePart(id, path, name)}/>
        </>
        }
        <AGLoading loading={this.state.loading} />
      </>
    );
  }
  
  componentDidUpdate(prevProps: Readonly<ExampleProps>, prevState: Readonly<ExampleState>, snapshot?: any) {
    if(this.mount && this.state.currentModule !== ViewModuleState.OnModule) {
      this.mount!.appendChild(this.renderer!.domElement);
      this.setState({currentModule: ViewModuleState.OnModule});
    }
  }
}

export const getServerSideProps: GetServerSideProps<ExampleProps> = async (context) => {
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
      subdomain = configCampaign!.value;
    }
  }
  
  const campaigns = (await FirebaseUtil.Instance().GetParameters<string[]>(FirestoreParameters.Campaigns))[0];
  const isCampaign = campaigns.some(c => c === subdomain);
  
  let _baseMeshPath: string;
  let _campaignConfig: CampaignConfig;
  let _selectListBodyParts: BasicData[];
  let _selectListAccessories: BasicData[];
  
  if(isCampaign) {
    _baseMeshPath = `base_mesh/${subdomain}.glb`;
    const result = await FirebaseUtil.Instance().GetParameters(subdomain!, subdomain! + GV.Acc, subdomain! + GV.Config);
    _selectListBodyParts = result[0] as BasicData[];
    _selectListAccessories = result[1] as BasicData[];
    _campaignConfig = result[2] as CampaignConfig;
  }
  else {
    _baseMeshPath = `base_mesh/${GV.BaseCampaign}.glb`;
    const result = await FirebaseUtil.Instance().GetParameters(GV.BaseCampaign, GV.BaseCampaign + GV.Acc, GV.BaseCampaign + GV.Config);
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