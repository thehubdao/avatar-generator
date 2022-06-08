import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export function GetBaseScene(): Scene {
  let scene = new Scene();
  return scene;
}

export function GetBaseCamera(): PerspectiveCamera {
  let camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  
  return camera;
}

export function GetBaseRenderer(): WebGLRenderer {
  let renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  return renderer;
}

export function GetBaseCameraControls(camera: PerspectiveCamera, domElement: HTMLCanvasElement) {
  let controls = new OrbitControls(camera, domElement);
  return controls;
}

