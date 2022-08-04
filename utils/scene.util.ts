import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export function GetBaseScene(): Scene {
  let scene = new Scene();
  return scene;
}

export function FrustumCulledFalse(scene: Scene) {
  scene.traverse((object) => {
    object.frustumCulled = false;
  });
}

export function GetBaseCamera(): PerspectiveCamera {
  let camera = new PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0.5, 0.7, 2.3);
  
  return camera;
}

export function GetBaseRenderer(): WebGLRenderer {
  let renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  return renderer;
}

export function GetBaseCameraControls(camera: PerspectiveCamera, domElement: HTMLCanvasElement) {
  let controls = new OrbitControls(camera, domElement);
  controls.target.set(0, 1, 0);
  // TODO: Elaborate
  // controls.enablePan = false;
  
  return controls;
}
