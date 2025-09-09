import {AnimationAction, AnimationMixer, Object3D} from "three";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader.js";
import {FirebaseGltfModel} from "../importer.util";
import {LogError} from "../common.util";
import {Module} from "../../enums/common.enum";

export function CreateAnimationMixer(objScene: Object3D) {
  return new AnimationMixer(objScene);
}

export async function SetAnimation(mixer: AnimationMixer, animation: GLTF | string | undefined, campaign?: string, onAnimationSet?: () => Promise<void>) {
  if(animation == undefined){
    LogError(Module.AnimationUtil, 'Missing animation to load');
    return null;
  }
  
  let animationFile: GLTF;
  if(typeof animation === 'string'){
    const animationResult = await FirebaseGltfModel(animation, campaign);
    if (!animationResult.success){
      LogError(Module.AnimationUtil, animationResult.errMessage);
      return null;
    }

    animationFile = animationResult.value;
  }
  else {
    animationFile = animation;
  }
  
  let clipAction: AnimationAction | null = null;
  if(animationFile.animations.length > 0) {
    clipAction = mixer.clipAction(animationFile.animations[0]);
    clipAction.play();
    if(onAnimationSet)
      await onAnimationSet();
  }
  return clipAction;
}