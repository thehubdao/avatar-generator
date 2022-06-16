import {Component} from "react";
import {AnimationMixer, Clock, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import {GetBaseCamera, GetBaseCameraControls, GetBaseRenderer, GetBaseScene} from "../utils/scene.util";
import {GetTestAxis, GetTestLights} from "../utils/test-scene.util";
import {GetAssetsListByType, ImporterUtil} from "../utils/importer.util";
import Head from "next/head";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {BodyPartTypeEnum} from "../enums/common.enum";
import {BodyPartLocationApi} from "../interfaces/api.interface";
import {GetOptions} from "../utils/common.util";
import {ReplaceModelPartOnly} from "../utils/model.util";
import {ExporterUtil} from "../utils/exporter.util";

interface ExampleState {
  rotateCamera: boolean;
  selectedPart: BodyPartTypeEnum;
  partList: BodyPartLocationApi[];
  selectList: string[];
  cameraPosX: number;
  cameraPosY: number;
  cameraPosZ: number;
  savedModels: Record<number, GLTF>;
}

export default class Example extends Component<undefined, ExampleState> {
  mount: HTMLDivElement | null = null;
  clock: Clock = new Clock();
  
  scene?: Scene;
  camera?: PerspectiveCamera;
  renderer?: WebGLRenderer;
  mixer?: AnimationMixer;
  controls?: OrbitControls;

  doCameraMovement: boolean = false;
  cameraTargetPosition?: Vector3;
  
  baseModel?: GLTF;
  
  tanFOV?: number;
  windowHeight?: number;
  
  constructor() {
    super(undefined);
    this.state = {
      rotateCamera: true,
      selectedPart: BodyPartTypeEnum.Chest,
      partList: [],
      selectList: [],
      cameraPosX: 0,
      cameraPosY: 0,
      cameraPosZ: 0,
      savedModels: {},
    };
  }
  
  async componentDidMount() {
    await this.avatarScene();
    await this.getPartList();
  }
  
  async getPartList() {
    const _selectList = GetOptions(BodyPartTypeEnum);
    const _partList = await GetAssetsListByType(this.state.selectedPart); 
    this.setState({ partList: _partList, selectList: _selectList });
  }
  
  async avatarScene() {
    this.scene = GetBaseScene();
    this.camera = GetBaseCamera();
    this.renderer = GetBaseRenderer();
    
    this.cameraTargetPosition = this.camera.position.clone();
    this.setState({
      cameraPosX: this.cameraTargetPosition.x,
      cameraPosY: this.cameraTargetPosition.y,
      cameraPosZ: this.cameraTargetPosition.z
    });

    // mount scene
    this.mount!.appendChild(this.renderer.domElement);

    // camera controls
    this.controls = GetBaseCameraControls(this.camera, this.renderer.domElement);

    // Add test assets
    // this.scene.add(GetTestCube());
    // this.scene.add(GetTestAxis(5));

    const lights = GetTestLights();
    for(const l of lights) {
      this.scene.add(l);
    }

    this.baseModel = await ImporterUtil.LoadGltfModel('/resources/001_BASE_MESH.glb');

    this.mixer = new AnimationMixer(this.baseModel.scene);

    this.baseModel.animations.forEach((clip) => {
      if(this.mixer) this.mixer.clipAction(clip).play();
    });

    this.scene.add(this.baseModel.scene);

    // remember these initial values
    this.tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov / 2));
    this.windowHeight = window.innerHeight;

    window.addEventListener( 'resize', this.onWindowResize, false );

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
    if (this.mixer) this.mixer.update(delta);
    
    this.controls!.update();
    
    if(this.camera!.position.distanceTo(this.cameraTargetPosition!) < 0.1) {
      this.doCameraMovement = false;
      this.controls!.autoRotate = this.state.rotateCamera;
    }
    
    if(this.doCameraMovement)
      this.camera!.position.lerp(this.cameraTargetPosition!, delta);

    this.renderer!.render(this.scene!, this.camera!);
  }
  
  onClickChangeCamPosition = () => {
    this.doCameraMovement = true;
    this.controls!.autoRotate = false;
    this.cameraTargetPosition = new Vector3(this.state.cameraPosX, this.state.cameraPosY, this.state.cameraPosZ);
  }
  
  updateCameraAutoRotate = (checked: boolean) => {
    this.setState({ rotateCamera: checked });
    this.controls!.autoRotate = checked;
  }
  
  async onCategoryChange(value: number) {
    const enumValue = value as BodyPartTypeEnum;
    const _partList = await GetAssetsListByType(enumValue);
    this.setState({ partList: _partList, selectedPart: enumValue });
  }
  
  async changePart(id: number, partUrl: string) {
    let replaceModel: GLTF;
    if(this.state.savedModels[id]) {
      replaceModel = this.state.savedModels[id];
    } else {
      replaceModel = await ImporterUtil.FetchGltfModel(partUrl);
      const _savedModels = {...this.state.savedModels};
      _savedModels[id] = replaceModel;
      this.setState({ savedModels: _savedModels });
    }
    
    await ReplaceModelPartOnly(this.baseModel!, replaceModel, this.state.selectedPart);
  }
  
  async exportModel() {
    await ExporterUtil.ExportModelGlb(this.baseModel!);
  }
  
  optionList() {
    return this.state.selectList.map((x) => {
      const _value = BodyPartTypeEnum[x as any];
      return <option value={_value} key={_value}>{x}</option>
    });
  }
  
  partList() {
    return this.state.partList.map((x) => {
      return (
          <div className="flex justify-center py-2" key={x.id}>
            <button
              className="font-bold py-2 px-4 mx-2 w-full rounded bg-orange-400 text-white"
              onClick={() => this.changePart(x.id, x.url)}>
              {x.name}
            </button>
          </div>
      );
    });
  }

  render() {
    return (
      <>
        <Head>
          <title>ThreeJs Example</title>
        </Head>
        <div className="fixed left-0 top-0 w-2/6 h-screen bg-slate-600 bg-opacity-50 p-2">
          <div className="mb-2 flex bg-slate-400">
            <input className="mt-1.5 mx-2" type="checkbox" checked={this.state.rotateCamera} onChange={e => this.updateCameraAutoRotate(e.target.checked)} />
            <p>Rotate camera</p>
          </div>
          <div className="mb-2 w-full bg-slate-400">
            <div className="flex pt-2 mb-2 justify-evenly">
              <div className="flex justify-center">
                <p>X:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraPosX} onChange={(e) => this.setState({cameraPosX: Number(e.target.value)})}/>
              </div>
              <div className="flex justify-center">
                <p>Y:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraPosY} onChange={(e) => this.setState({cameraPosY: Number(e.target.value)})}/>
              </div>
              <div className="flex justify-center">
                <p>Z:</p>
                <input className="ml-1 w-1/3 rounded pl-1" type="number" value={this.state.cameraPosZ} onChange={(e) => this.setState({cameraPosZ: Number(e.target.value)})} />
              </div>
            </div>
            <div className="flex justify-center pb-2">
              <button className="font-bold py-2 px-4 rounded bg-blue-500 text-white" onClick={() => this.onClickChangeCamPosition()}>Change CamPosition</button>
            </div>
          </div>
          <div className="mb-2 bg-slate-400">
            <div className="m-2">
              <select defaultValue={this.state.selectedPart} className="w-full my-2" onChange={(e) => this.onCategoryChange(Number(e.target.value))}>
                {this.optionList()}
              </select>
            </div>
          </div>
          <div className="mb-2 bg-slate-400">
            {this.partList()}
          </div>
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
        <div>
          <div ref={ref => this.mount = ref} />
        </div>
      </>
    );
  }
}