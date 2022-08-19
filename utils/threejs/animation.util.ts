import {AnimationMixer, Object3D} from "three";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";

export function CreateAnimationMixer(objScene: Object3D) {
  return new AnimationMixer(objScene);
}

export async function SetAnimation(mixer: AnimationMixer, animation: GLTF, onAnimationSet?: Function) {
  if(animation.animations.length > 0) {
    mixer.clipAction(animation.animations[0]).play();
    if(onAnimationSet)
      await onAnimationSet();
  }
}