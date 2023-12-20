import {AnimationMixer, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export interface SceneInterface {
  scene: Scene;
  armature?: GLTF;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  mixer?: AnimationMixer;
  controls: OrbitControls;
}