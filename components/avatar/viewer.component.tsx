import { useEffect, useRef } from "react";
import {
  AnimationMixer,
  Clock,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Delay, LogError, LogWarning } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import {
  FrustumCulledFalse,
  GetBaseCamera,
  GetBaseCameraControls,
  GetBaseRenderer,
  GetBaseScene
} from "../../utils/threejs/scene.util";
import { AGVector3 } from "../../interfaces/common.interface";
import { GetToneTexture } from "../../utils/threejs/texture.util";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { CreateEffectComposer } from "../../utils/threejs/postProcessing.util";
import { ConfigPostProcessing } from "../../interfaces/postProcessing.interface";
import SceneUtil from "../../utils/scene.utils";

//#region Logic
let _canvas: HTMLCanvasElement | undefined;
let _scene: Scene | undefined;
let _camera: PerspectiveCamera | undefined;
let _renderer: WebGLRenderer | undefined;
let _composer: EffectComposer | undefined;
let _controls: OrbitControls | undefined;
const _mixers: AnimationMixer[] = [];
const _sceneObjs: Map<string, number> = new Map();

let _cameraPos: Vector3 = new Vector3();
let _cameraLookAt: Vector3 = new Vector3();
let _willCameraMove = false;
let _willCameraLookAt = false;

const _clock: Clock = new Clock();

let _tanFOV: number | undefined;
let _windowHeight: number | undefined;

let _animReq: number;

export function AddMixer(newMixer: AnimationMixer) {
  if (!_mixers.some(m => m === newMixer))
    _mixers.push(newMixer);
}

export function RemoveMixer(mixer: AnimationMixer) {
  const index = _mixers.findIndex(m => m === mixer);
  if (index > 0)
    _mixers.slice(index, 1);
}

function DoAnimation(delta: number) {
  for (const mixer of _mixers) {
    mixer.update(delta);
  }
}

function Animate() {
    if (_scene == undefined) return void LogError(Module.Viewer, "Missing Scene for rendering!");
    if (_renderer == undefined) return void LogError(Module.Viewer, "Missing Renderer on viewer!");
    if (_camera == undefined) return void LogError(Module.Viewer, "Missing Camera for rendering!");
    if (_controls == undefined) return void LogError(Module.Viewer, "Missing camera controls!");

    _animReq = requestAnimationFrame(Animate);

    const delta = _clock.getDelta();

    DoAnimation(delta);

    _controls.update();

    if (_camera.position.distanceTo(_cameraPos) < 0.1) {
      _willCameraMove = false;
    }

    if (_controls.target.distanceTo(_cameraLookAt) < 0.1) {
      _willCameraLookAt = false;
    }

    if (_willCameraMove) _camera.position.lerp(_cameraPos, delta);
    if (_willCameraLookAt) _controls.target.lerp(_cameraLookAt, delta);

    if (_composer) {
      _composer.render();
    } else {
      _renderer.render(_scene, _camera);
    }
  }

// function ResizeCanvas(windowSize: boolean = false) {
//   if (_canvas == undefined) return void LogError(Module.Viewer, "Missing canvas on resize!");
//     if (_scene == undefined) return void LogError(Module.Viewer, "Missing scene on resize!");
//     if (_renderer == undefined) return void LogError(Module.Viewer, "Missing Renderer on resize!");
//     if (_camera == undefined) return void LogError(Module.Viewer, "Missing Camera for resize!");
//     if (!(_tanFOV && _windowHeight))
//       return void LogError(Module.AvatarGenerator, "Missing fov/windowHeight on resize!"); 

//     console.log(windowSize ? 'Resizing to window' : 'Resizing to canvas');


//     const width = (windowSize ? window.innerWidth : _canvas.width);
//     const height = (windowSize ? window.innerHeight : _canvas.height);

//     _camera.aspect = width / height;
//     _camera.fov = (360 / Math.PI) * Math.atan(_tanFOV * (height / height));
//     _camera.updateProjectionMatrix();

//     if (_composer) {
//       _composer.setSize(width, height);
//       console.log(`Resizing composer to ${width}x${height}`);

//       _composer.render();
//     } else {
//       _renderer.setSize(width, height);
//       _renderer.render(_scene, _camera);
//     }
// }

export function AddComposer(postProcessing: ConfigPostProcessing[]) {
  if (_scene == undefined) return void LogError(Module.Viewer, "Missing Scene to create composer!");
  if (_renderer == undefined) return void LogError(Module.Viewer, "Missing Renderer to create composer!");
  if (_camera == undefined) return void LogError(Module.Viewer, "Missing Camera to create composer!");

  _composer = CreateEffectComposer(_renderer, _scene, _camera, postProcessing);
}

export function AddToScene(toAdd: Object3D, objName?: string) {
  if (_scene == undefined)
    return void LogError(Module.Viewer, "Scene not started yet on viewer!");

  const addedPos = _scene.children.length;

  FrustumCulledFalse(toAdd);
  toAdd.name = objName ?? '';
  _scene.add(toAdd);

  if (objName != undefined) _sceneObjs.set(objName, addedPos);
}

export function RemoveFromScene(toRemove: string) {
  if (_scene == undefined)
    return void LogError(Module.Viewer, "Scene not started yet on viewer!");

  const location = _sceneObjs.get(toRemove);
  if (location == undefined)
    return void LogWarning(Module.Viewer, "Item on scene to remove doesn't exist!");

  for (const [key, value] of _sceneObjs) {
    if (value > location)
      _sceneObjs.set(key, value - 1);
  }
  _scene?.children.splice(location, 1);
}

export function AddBackgroundScene(texture: Texture) {
  if (_scene == undefined)
    return void LogError(Module.Viewer, "Scene not started yet on viewer!");

  _scene.background = texture;
}

export function AddLightEnvScene(texture: Texture) {
  if (_scene == undefined)
    return void LogError(Module.Viewer, "Scene not started yet on viewer!");

  _scene.environment = texture;
}

export function ChangeCamPosition(value: Vector3) {
  if (_controls == undefined) return void LogError(Module.Viewer, "Missing viewer Controls!");

  _willCameraMove = true;
  // _controls.autoRotate = false;
  _cameraPos = value;
}

export function AGChangeCamPosition(value: AGVector3 | undefined) {
  if (value == undefined) return;

  ChangeCamPosition(new Vector3(value.x, value.y, value.z));
}

export function ChangeLookAtPosition(value: Vector3) {
  if (_controls == undefined) return void LogError(Module.Viewer, "Missing viewer Controls!");

  _willCameraLookAt = true;
  // _controls.target = value;
  _cameraLookAt = value;
}

export function AGChangeLookAtPosition(value: AGVector3 | undefined) {
  if (value == undefined) return;

  ChangeLookAtPosition(new Vector3(value.x, value.y, value.z));
}

export function TakeCanvasPicture(mimeType = 'image/png') {
  return new Promise<Blob>((resolve, reject) => {
    if (_renderer == undefined) return reject("Missing scene");

    _renderer.domElement.toBlob(blob => {
      if (blob) {
        resolve(blob);
      }
    }, mimeType);
  });
}

export async function GetCanvasImageUrl(pos?: Vector3, target?: Vector3): Promise<string | null> {
  if (_renderer == undefined) {
    void LogError(Module.Viewer, 'Missing renderer');
    return null;
  }

  if (_scene === undefined) {
    void LogError(Module.Viewer, 'Missing scene');
    return null;
  }

  if (_camera === undefined) {
    void LogError(Module.Viewer, 'Missing camera');
    return null;
  }

  let shot: string;

  if (pos !== undefined) {
    const lastPos = new Vector3(_camera?.position.x, _camera?.position.y, _camera?.position.z);
    const lastTarget = new Vector3(_controls?.target.x, _controls?.target.y, _controls?.target.z);
    _camera?.position.set(pos.x, pos.y, pos.z);
    _controls?.target.set(target?.x ?? 0, target?.y ?? 1.65, target?.z ?? 0);

    const imageSize = window.innerWidth < 1024 ? 512 : 1024;
    const pixelBuffer = new Uint8Array(imageSize * imageSize * 4);
    const renderTarget = new WebGLRenderTarget(imageSize, imageSize);

    cancelAnimationFrame(_animReq);
    await Delay(100);

    if (_composer) {
      _composer.render(); 
      _composer.renderTarget1 = renderTarget;
      const renderFromComposer = _composer.renderTarget1;
      console.log(_composer.readBuffer);
      
      _renderer.readRenderTargetPixels(renderFromComposer, 0, 0, imageSize, imageSize, pixelBuffer);
    } else {
      _renderer.setRenderTarget(renderTarget);
      _renderer.render(_scene, _camera);
      _renderer.setRenderTarget(null);
      _renderer.readRenderTargetPixels(renderTarget, 0, 0, imageSize, imageSize, pixelBuffer);
    }

    // Convert the image data to a base64-encoded PNG
    const canvas = document.createElement('canvas');
    canvas.width = imageSize;
    canvas.height = imageSize;
    const context = canvas.getContext('2d');
    const imageDataObject = context!.createImageData(imageSize, imageSize);

    context!.putImageData(imageDataObject, 0, 0);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = imageSize;
    finalCanvas.height = imageSize;
    const finalContext = finalCanvas.getContext('2d');
    
    finalContext!.scale(1, -1); // Flip vertically
    finalContext!.translate(0, -imageSize); // Move origin back
    finalContext!.drawImage(canvas, 0, 0);

    finalContext!.putImageData(imageDataObject, 0, 0);

    shot = finalCanvas.toDataURL('image/png');


    // await Delay(100);
    // shot = _renderer.domElement.toDataURL();
    _camera.position.set(lastPos.x, lastPos.y, lastPos.z);
    _controls?.target.set(lastTarget.x, lastTarget.y, lastTarget.z);
  } else {
    shot = _renderer.domElement.toDataURL();
  }

  // Animate();
  return (shot)
}

//#endregion

//#region Component
interface AvatarViewerProps {
  onReady: () => Promise<void>;
  defaultCamPos?: AGVector3;
  defaultCamLookAt?: AGVector3;
  editMode?: boolean;
  enablePan?: boolean;
}

export default function AvatarViewer({ onReady, defaultCamPos, defaultCamLookAt, editMode, enablePan }: AvatarViewerProps) {
  const threeCanvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const componentDidMount = async () => {
      await initScene();
      await onReady()
    };

    componentDidMount()
      .catch(err => console.error(err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      window.removeEventListener('resize', onWindowResize, false);
      cancelAnimationFrame(_animReq);
      disposeScene();

      threeCanvas.current?.remove();
    }
  }, []);



  async function preload() {
    await GetToneTexture();
  }

  async function initScene() {
    if (threeCanvas.current == null) return LogError(Module.AvatarGenerator, "Error initializing canvas!");

    _scene = GetBaseScene();
    _camera = GetBaseCamera(defaultCamPos);
    _renderer = GetBaseRenderer();
    _controls = GetBaseCameraControls(_camera, _renderer.domElement, defaultCamLookAt, enablePan) as OrbitControls;

    // mount scene
    threeCanvas.current.appendChild(_renderer.domElement);

    _canvas = _renderer.domElement;

    _cameraPos = _camera.position.clone();
    _cameraLookAt = _controls.target.clone();

    // remember these initial values
    _tanFOV = Math.tan(((Math.PI / 180) * _camera.fov / 2));
    _windowHeight = window.innerHeight;

    await preload();

    window.addEventListener('resize', onWindowResize, false);
    Animate();

    // let's save renderer
    const sceneUtil = SceneUtil.Instance()
    sceneUtil.storeRenderer(_renderer)
  }

  function stopCamMovement() {
    _willCameraLookAt = false;
    _willCameraMove = false;
  }

  function disposeScene() {
    if (_renderer === undefined) return LogWarning(Module.Viewer, "Error disposing renderer, renderer is undefined");
    if (_scene === undefined) return LogWarning(Module.Viewer, "Error disposing scene, scene is undefined");

    const cleanMaterial = (material: Material) => {
      material.dispose();

      // dispose textures
      for (const key of Object.keys(material)) {
        const value = material[key as keyof Material];
        if (value && typeof value === 'object' && 'minFilter' in value) {
          value.dispose();
        }
      }
    }

    _scene.traverse(object => {
      if (!(object as Mesh).isMesh) return

      const mesh = object as Mesh;

      if ((mesh.material as Material).isMaterial) {
        cleanMaterial(mesh.material as Material);
      } else {
        // an array of materials
        for (const material of (mesh.material as Material[])) cleanMaterial(material);
      }

      mesh.geometry.dispose();
    })

    // _renderer.dispose();
    // _scene.clear();
    _renderer.forceContextLoss();
  }

  const onWindowResize = () => {
    if (_scene == undefined) return void LogError(Module.Viewer, "Missing scene on resize!");
    if (_renderer == undefined) return void LogError(Module.Viewer, "Missing Renderer on resize!");
    if (_camera == undefined) return void LogError(Module.Viewer, "Missing Camera for resize!");
    if (!(_tanFOV && _windowHeight))
      return void LogError(Module.AvatarGenerator, "Missing fov/windowHeight on resize!");

    _camera.aspect = window.innerWidth / window.innerHeight;

    // adjust the FOV
    _camera.fov = (360 / Math.PI) * Math.atan(_tanFOV * (window.innerHeight / _windowHeight));

    _camera.updateProjectionMatrix();
    //this.camera!.lookAt(this.scene!.position);

    _renderer.setSize(window.innerWidth, window.innerHeight);
    _renderer.render(_scene, _camera);
  }

  return (
    <div className={`relative w-full ${editMode ? 'xl:w-[42%] h-[calc(100vh-256px)] xl:h-full' : 'h-full'} overflow-hidden flex justify-center items-center transition-all duration-300`} ref={threeCanvas} onMouseDown={() => stopCamMovement()} />
  );
}
//#endregion 