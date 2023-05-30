import {useEffect, useRef} from "react";
import {AnimationMixer, Clock, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {LogError, LogWarning} from "../../utils/common.util";
import {Module} from "../../enums/common.enum";
import {
  FrustumCulledFalse,
  GetBaseCamera,
  GetBaseCameraControls,
  GetBaseRenderer,
  GetBaseScene
} from "../../utils/threejs/scene.util";
import {AGVector3} from "../../interfaces/common.interface";

//#region Logic
let _scene: Scene | undefined;
let _camera: PerspectiveCamera | undefined;
let _renderer: WebGLRenderer | undefined;
let _controls: OrbitControls | undefined;
const _mixers: AnimationMixer[] = [];
const _sceneObjs: Map<string, number> = new Map();

let _cameraPos: Vector3 = new Vector3();
let _cameraLookAt: Vector3 = new Vector3();
let _doCameraMovement = false;
let _doCameraLookAt = false;

const _clock: Clock = new Clock();

let _tanFOV: number | undefined;
let _windowHeight: number | undefined;

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

export function AddToScene(toAdd: Object3D, objName?: string) {
  if (_scene == undefined)
    return void LogError(Module.Viewer, "Scene not started yet on viewer!");

  const addedPos = _scene.children.length;
  
  FrustumCulledFalse(toAdd);
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

export function ChangeCamPosition(value: Vector3) {
  if (_controls == undefined) return void LogError(Module.Viewer, "Missing viewer Controls!");

  _doCameraMovement = true;
  // _controls.autoRotate = false;
  _cameraPos = value;
}

export function AGChangeCamPosition(value: AGVector3 | undefined) {
  if (value == undefined) return;
  
  ChangeCamPosition(new Vector3(value.x, value.y, value.z));
}

export function ChangeLookAtPosition(value: Vector3) {
  if (_controls == undefined) return void LogError(Module.Viewer, "Missing viewer Controls!");
  
  _doCameraLookAt = true;
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

//#endregion

//#region Component
interface AvatarViewerProps {
  onReady: () => Promise<void>;
  defaultCamPos?: AGVector3;
  defaultCamLookAt?: AGVector3;
  editMode?: boolean
}

export default function AvatarViewer({onReady, defaultCamPos, defaultCamLookAt, editMode}: AvatarViewerProps) {
  const threeCanvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const componentDidMount = async () => {
      await initScene();

      await onReady()
    };

    componentDidMount()
      .catch(err => console.error(err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initScene() {
    if (threeCanvas.current == null) return LogError(Module.AvatarGenerator, "Error initializing canvas!");

    _scene = GetBaseScene();
    _camera = GetBaseCamera(defaultCamPos);
    _renderer = GetBaseRenderer();
    _controls = GetBaseCameraControls(_camera, _renderer.domElement, defaultCamLookAt);

    // mount scene
    threeCanvas.current.appendChild(_renderer.domElement);

    _cameraPos = _camera.position.clone();
    _cameraLookAt = _controls.target.clone();

    // remember these initial values
    _tanFOV = Math.tan(((Math.PI / 180) * _camera.fov / 2));
    _windowHeight = window.innerHeight;

    window.addEventListener('resize', onWindowResize, false);
    Animate();
  }

  function stopCamMovement() {
    _doCameraLookAt = false;
    _doCameraMovement = false;
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

  const Animate = () => {
    if (_scene == undefined) return void LogError(Module.Viewer, "Missing Scene for rendering!");
    if (_renderer == undefined) return void LogError(Module.Viewer, "Missing Renderer on viewer!");
    if (_camera == undefined) return void LogError(Module.Viewer, "Missing Camera for rendering!");
    if (_controls == undefined) return void LogError(Module.Viewer, "Missing camera controls!");

    requestAnimationFrame(Animate);

    const delta = _clock.getDelta();

    DoAnimation(delta);

    _controls.update();

    if (_camera.position.distanceTo(_cameraPos) < 0.1) {
      _doCameraMovement = false;
    }
    
    if (_controls.target.distanceTo(_cameraLookAt) < 0.1) {
      _doCameraLookAt = false;
    }

    if (_doCameraMovement) _camera.position.lerp(_cameraPos, delta);
    if (_doCameraLookAt) _controls.target.lerp(_cameraLookAt, delta);

    _renderer.render(_scene, _camera);
  };

  return (
    <>
      <div className={`relative h-full w-full ${editMode ? 'xl:w-[42%]':''} xl:overflow-hidden xl:flex xl:justify-center`} ref={threeCanvas} onMouseDown={() => stopCamMovement()}/>
    </>
  );
}
//#endregion