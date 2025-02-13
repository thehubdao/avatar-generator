import {AnimationMixer, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

export interface SceneInterface {
  scene: Scene;
  armature?: GLTF;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  mixer?: AnimationMixer;
  controls: OrbitControls;
}