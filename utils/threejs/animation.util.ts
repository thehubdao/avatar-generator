import {AnimationMixer, Object3D} from "three";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {FirebaseGltfModel} from "../importer.util";
import {LogError} from "../common.util";
import {Module} from "../../enums/common.enum";

export function CreateAnimationMixer(objScene: Object3D) {
  return new AnimationMixer(objScene);
}

export async function SetAnimation(mixer: AnimationMixer, animation: GLTF | string | undefined, campaign?: string, onAnimationSet?: Function) {
  if(animation == undefined)
    return LogError(Module.AnimationUtil, 'Missing animation to load');
  
  let animationFile: GLTF;
  if(typeof animation === 'string'){
    animationFile = await FirebaseGltfModel(animation, campaign);
  }
  else {
    animationFile = animation as GLTF;
  }
  
  if(animationFile.animations.length > 0) {
    mixer.clipAction(animationFile.animations[0]).play();
    if(onAnimationSet)
      await onAnimationSet();
  }
}