import {Component} from "react";
import {AnimationMixer, Clock, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {GetBaseCamera, GetBaseCameraControls, GetBaseRenderer, GetBaseScene} from "../utils/scene.util";
import {GetTestAxis, GetTestCube, GetTestLights} from "../utils/test-scene.util";
import {ImporterUtil} from "../utils/importer.util";
import {ReplaceModelPart} from "../utils/model.util";

export default class Example extends Component {
  mount: HTMLDivElement | null = null;
  clock: Clock = new Clock();
  
  scene?: Scene;
  camera?: PerspectiveCamera;
  renderer?: WebGLRenderer;
  mixer?: AnimationMixer;

  tanFOV?: number;
  windowHeight?: number;
  
  async componentDidMount() {
    this.scene = GetBaseScene();
    this.camera = GetBaseCamera();
    this.renderer = GetBaseRenderer();
    
    // mount scene
    this.mount!.appendChild(this.renderer.domElement);

    // camera controls
    let controls = GetBaseCameraControls(this.camera, this.renderer.domElement);

    // Add test assets
    this.scene.add(GetTestCube());
    this.scene.add(GetTestAxis(5));
    
    const lights = GetTestLights();
    for(const l of lights) {
      this.scene.add(l);
    }
    
    let baseModel = await ImporterUtil.LoadGltfModel('/resources/human-03-anim.glb');

    this.mixer = new AnimationMixer(baseModel.scene);

    baseModel.animations.forEach((clip) => {
      if(this.mixer) this.mixer.clipAction(clip).play();
    });

    this.scene.add(baseModel.scene);
    
    await ReplaceModelPart(baseModel, '/resources/human-03-b.glb', 1);

    // remember these initial values
    this.tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov / 2));
    this.windowHeight = window.innerHeight;
    
    window.addEventListener( 'resize', this.onWindowResize, false );
    //window.addEventListener("mousedown", this.onMouseDown, false);
    
    this.Animate();
  }
  
  onMouseDown = (event: MouseEvent) => {
    console.log(event.clientX, event.clientY);
  }

  onWindowResize = (event: Event) => {
    this.camera!.aspect = window.innerWidth / window.innerHeight;

    // adjust the FOV
    this.camera!.fov = (360 / Math.PI) * Math.atan(this.tanFOV! * ( window.innerHeight / this.windowHeight!));

    this.camera!.updateProjectionMatrix();
    this.camera!.lookAt(this.scene!.position);

    this.renderer!.setSize(window.innerWidth, window.innerHeight);
    this.renderer!.render(this.scene!, this.camera!);
  }

  // Animate the scene
  Animate = () => {
    requestAnimationFrame(this.Animate);

    let delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(delta);

    this.renderer!.render(this.scene!, this.camera!);
  }

  render() {
    return (
      <div ref={ref => this.mount = ref} />
    );
  }
}