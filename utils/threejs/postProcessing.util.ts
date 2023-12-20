import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ConfigPostProcessing, ConfigUnrealBloomPass } from '../../interfaces/postProcessing.interface';
import { PostProcessType } from '../../enums/postProcecssing.enum';

export function CreateEffectComposer(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, postProcecssing: ConfigPostProcessing[]): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass( GetRenderPass(scene, camera) );
  for (const pass of postProcecssing) {
    GetGeneratePassFunction(composer, pass);
  }

  return composer;
}

function GetGeneratePassFunction(composer: EffectComposer, pass: ConfigPostProcessing ) {
  switch (pass.type) {
    case PostProcessType.UnrealBloom:
      composer.addPass( GetUnrealBloomPass(pass.params) )
      break;
    default:
      break;
  }
}

function GetRenderPass(scene: Scene, camera: PerspectiveCamera): RenderPass {
  return new RenderPass( scene, camera );
}

export function GetUnrealBloomPass( {resolution, strength, radius, threshold}: ConfigUnrealBloomPass): UnrealBloomPass {
  return new UnrealBloomPass(resolution, strength, radius, threshold);
}

