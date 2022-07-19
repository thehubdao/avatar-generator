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
import {GetTestLights} from "../utils/test-scene.util";
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
import {AttributeValues, FirestoreParameters, GlobalValues, ViewModuleState} from "../enums/common.enum";
import {AccLocationApi, BodyPartLocationApi} from "../interfaces/api.interface";
import {ReplaceModelAccessory, ReplaceModelPartOnly} from "../utils/model.util";
import {ExporterUtil} from "../utils/exporter.util";
import {GetServerSideProps} from "next";
import {AccessoryInfoInterface, BasicData, ExportInterface, PartInfoInterface} from "../interfaces/common.interface";
import {FirebaseUtil} from "../utils/firebase.util";

interface ExampleProps {
  campaign?: string | null;
  baseMeshPath: string;
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
  currentModule: ViewModuleState
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
      currentModule: ViewModuleState.OnModule
    };
    
    this.mount = null;
    this.clock = new Clock();
    this.exportData = {attributes: []};
    this.onIFrame = false;
  }
  
  async componentDidMount() {
    await this.avatarScene();
    await this.getPartList();
    await this.getAccessoryList();
    await this.getAccessoryBones();
    await this.getPartsData();
    await this.loadPreData();
    
    // IFrame impl
    this.tellParentIAmReady();
  }

  tellParentIAmReady() {
    window.parent.postMessage({source: "avatar-generator", eventName: 'ready'}, '*');
    window.addEventListener("message", ({data, source}) => {
      const parentData: {target: string, type: string} = JSON.parse(data);
      if(parentData.target === 'avatar-generator' && parentData.type === 'subscribe')
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
    // console.log('input', this.partList);
    // console.log('filterBy', bodyPartType);
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

    this.baseModel = await ImporterUtil.FirebaseGltfModel(this.props.baseMeshPath);
    console.log('base', this.baseModel);
    
    this.mixer = new AnimationMixer(this.baseModel.scene);

    this.baseModel.animations.forEach((clip) => {
      if(this.mixer) {
        this.mixer.clipAction(clip).play();
        this.hasAnimation = true;
      }
    });
    
    this.scene.add(this.baseModel.scene);

    // remember these initial values
    this.tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov / 2));
    this.windowHeight = window.innerHeight;

    window.addEventListener( 'resize', this.onWindowResize, false );
    
    FrustumCulledFalse(this.scene);

    this.Animate();
  }

  onWindowResize = (event: Event) => {
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
  
  onClickChangeCamPosition = () => {
    this.doCameraMovement = true;
    this.controls!.autoRotate = false;
    this.cameraTargetPosition = this.state.cameraPos.clone();
  }
  
  onClickChangeLookAtPosition = () => {
    this.controls!.target = this.state.cameraLookAt.clone();
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
  }
  
  async onAccessoryChange(value: string) {
    const _accessoryList = this.filterListByAccessory(value);
    this.setState({ accessoryList: _accessoryList, selectedAcc: value });
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
    this.exportData!.model = await ExporterUtil.ExportModelGlb(this.baseModel!);
    console.log(this.exportData);
    if(this.onIFrame)
      window.parent.postMessage({source: 'avatar-generator', eventName: 'exported', data: this.exportData }, '*');
  }
  
  optionList() {
    return this.state.selectList.map((x) => {
      return <option value={x.id} key={x.id}>{x.id}</option>
    });
  }

  optionListAccessories() {
    return this.state.aSelectList.map((x) => {
      return <option value={x.id} key={x.id}>{x.id}</option>
    });
  }
  
  partSelectList() {
    return this.state.partList.map((x) => {
      return (
          <div className="flex justify-center py-2" key={x.id}>
            <button
              className="font-bold py-2 px-4 mx-2 w-full rounded bg-orange-400 text-white"
              onClick={() => this.changePart(x.id, x.path, x.name)}>
              {x.name}
            </button>
          </div>
      );
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

  render() {
    return (
      <>
        {
          this.state.editModeSelected ?
            this.renderEditMode() :
            this.renderViewMode()
        }
      </>
    );
  }
    
  private renderEditMode() {
    return (
      <>
        <Head>
          <title>ThreeJs Example</title>
        </Head>
        <div className="fixed left-0 top-0 w-1/6 h-screen bg-slate-600 bg-opacity-50 p-2 hover:overflow-y-auto">
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
              <button className="font-bold py-2 px-4 rounded bg-blue-500 text-white" onClick={() => this.onClickChangeCamPosition()}>Change CamPosition</button>
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
              <button className="font-bold py-2 px-4 rounded bg-blue-500 text-white" onClick={() => this.onClickChangeLookAtPosition()}>Change CamLookAt</button>
            </div>
          </div>
          {
            this.partList && this.partList.length > 0 ?
              <div className="mb-2 bg-slate-400">
                <div className="m-2">
                  <p className="font-bold text-purple-900">Feature</p>
                  <select value={this.state.selectedPart} className="w-full my-2"
                          onChange={(e) => this.onCategoryChange(e.target.value)}>
                    {this.optionList()}
                  </select>
                </div>
              </div>
              : ''
          }
          <div className="mb-2 bg-slate-400">
            {this.partSelectList()}
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
          <div className="mb-2 bg-slate-400">
            <div className="flex justify-center py-2">
              <button
                className="font-bold py-2 px-4 mx-2 w-full rounded bg-indigo-400 text-white"
                onClick={() => this.setState({editModeSelected: false, currentModule: ViewModuleState.SwitchingModule})}>
                Goto ViewMode
              </button>
            </div>
          </div>
        </div>
        <div className="fixed right-0 top-0 w-1/6 bg-slate-600 bg-opacity-50 p-2">
          <p className="text-white">Logs</p>
          { this.state.logs ?
            <>
              <p className="text-white">Scene polycount: <span className="text-yellow-300">{this.state.logs.render.triangles}</span></p>
              <p className="text-white">Active Drawcalls: <span className="text-yellow-300">{this.state.logs.render.calls}</span></p>
              <p className="text-white">Textures in Memory: <span className="text-yellow-300">{this.state.logs.memory.textures}</span></p>
              <p className="text-white">Geometries in Memory: <span className="text-yellow-300">{this.state.logs.memory.geometries}</span></p>
            </>
            : ''}
        </div>
        <div>
          <div ref={ref => this.mount = ref} />
        </div>
      </>
    );
  }
  
  componentDidUpdate(prevProps: Readonly<ExampleProps>, prevState: Readonly<ExampleState>, snapshot?: any) {
    if(this.mount && this.state.currentModule !== ViewModuleState.OnModule) {
      this.mount!.appendChild(this.renderer!.domElement);
      this.setState({currentModule: ViewModuleState.OnModule});
    }
  }

  private renderViewMode() {
    return (
      <>
        <h1>
          Welcome to View Mode! :D
        </h1>
        <button
          className="font-bold py-2 px-4 rounded bg-blue-500 text-white"
          onClick={() => this.setState({editModeSelected: true, currentModule: ViewModuleState.SwitchingModule})}>
          Goto EditMode
        </button>
        <div>
          <div ref={ref => this.mount = ref} />
        </div>
      </>
    );
  }
}

export const getServerSideProps: GetServerSideProps<ExampleProps> = async (context) => {
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
  
  const campaigns = await FirebaseUtil.Instance().GetParameters<string[]>(FirestoreParameters.Campaigns);
  const isCampaign = campaigns.some(c => c === subdomain);
  
  let _baseMeshPath: string;
  let _selectListBodyParts: BasicData[];
  let _selectListAccessories: BasicData[];
  
  if(isCampaign) {
    _baseMeshPath = `base_mesh/${subdomain}.glb`;
    const result = await FirebaseUtil.Instance().GetParameters<BasicData[]>(subdomain!, `${subdomain!}Accessories`) as BasicData[][];
    _selectListBodyParts = result[0];
    _selectListAccessories = result[1];
  }
  else {
    _baseMeshPath = 'base_mesh/base.glb';
    const result = await FirebaseUtil.Instance().GetParameters<BasicData[]>('base', 'baseAccessories') as BasicData[][];
    _selectListBodyParts = result[0];
    _selectListAccessories = result[1];
  }
  
  return {
    props: {
      campaign: isCampaign ? subdomain : null,
      baseMeshPath: _baseMeshPath,
      selectListBodyParts: _selectListBodyParts,
      selectListAccessories: _selectListAccessories,
      attributeConfig: parsedConfig
    }
  };
}