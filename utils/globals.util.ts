import {AccessoryPartTypeEnum} from "../enums/common.enum";

export const baseModelPath = 'base_mesh/base.glb';
export const baseModelUrl = 'https://res.cloudinary.com/freak/image/upload/v1655437526/001_BASE_MESH.glb';

export const accessoryBones: { partType: AccessoryPartTypeEnum, boneName: string }[] = [
  { partType: AccessoryPartTypeEnum.Face, boneName: 'mixamorigHead' },
  { partType: AccessoryPartTypeEnum.Head, boneName: 'mixamorigHead' },
  { partType: AccessoryPartTypeEnum.Hips, boneName: 'mixamorigHips' },
  { partType: AccessoryPartTypeEnum.LeftHand, boneName: 'mixamorigLeftHand' },
  { partType: AccessoryPartTypeEnum.RightHand, boneName: 'mixamorigRightHand' },
]