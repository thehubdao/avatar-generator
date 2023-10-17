import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ConfigUnrealBloomPass } from '../../interfaces/postProcessing.interface';

export function CreateEffectComposer(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass( GetRenderPass(scene, camera) );
  composer.addPass( GetUnrealBloomPass({resolution: new Vector2( window.innerWidth, window.innerHeight ), strength: 1, radius: 0.4, threshold: 0.2}) )
  return composer;
}

function GetRenderPass(scene: Scene, camera: PerspectiveCamera): RenderPass {
  return new RenderPass( scene, camera );
}

export function GetUnrealBloomPass( {resolution, strength, radius, threshold}: ConfigUnrealBloomPass): UnrealBloomPass {
  return new UnrealBloomPass(resolution, strength, radius, threshold);
}

