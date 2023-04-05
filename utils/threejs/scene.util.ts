import {Object3D, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {SceneInterface} from "../../interfaces/scene.interface";
import {AGVector3} from "../../interfaces/common.interface";

export function InitSceneController(): SceneInterface {
  const camera = GetBaseCamera();
  const renderer = GetBaseRenderer();
  const controls = GetBaseCameraControls(camera, renderer.domElement);
  
  return {
    scene: GetBaseScene(),
    camera,
    renderer,
    controls
  };
}

export function GetBaseScene(): Scene {
  let scene = new Scene();
  return scene;
}

export function FrustumCulledFalse(obj: Object3D) {
  obj.traverse((sub) => {
    sub.frustumCulled = false;
  });
}

export function GetBaseCamera(): PerspectiveCamera {
  let camera = new PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0.5, 0.5, 3.5);
  
  return camera;
}

export function GetBaseRenderer(): WebGLRenderer {
  let renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  return renderer;
}

export function GetBaseCameraControls(camera: PerspectiveCamera, domElement: HTMLCanvasElement) {
  let controls = new OrbitControls(camera, domElement);
  controls.target.set(0, 0.7, 0);
  controls.enablePan = false;
  
  return controls;
}

export function SetCameraPosition(cam: PerspectiveCamera, {x, y, z}: AGVector3) {
  cam.position.set(x, y, z);
}