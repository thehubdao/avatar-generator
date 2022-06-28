import {AccessoryPartTypeEnum} from "../enums/common.enum";

export const apiUrl = 'https://res.cloudinary.com/freak/raw/upload/v1655440335/api.json';
export const baseModelUrl = 'https://res.cloudinary.com/freak/image/upload/v1655437526/001_BASE_MESH.glb';
// export const baseModelUrl = 'https://res.cloudinary.com/freak/image/upload/v1655438648/old-001_BASE_MESH_jtt1g8.glb';

export const accessoryBones: { partType: AccessoryPartTypeEnum, boneName: string }[] = [
  { partType: AccessoryPartTypeEnum.Face, boneName: 'mixamorigHead' },
  { partType: AccessoryPartTypeEnum.Head, boneName: 'mixamorigHead' },
  { partType: AccessoryPartTypeEnum.Hips, boneName: 'mixamorigHips' },
  { partType: AccessoryPartTypeEnum.LeftHand, boneName: 'mixamorigLeftHand' },
  { partType: AccessoryPartTypeEnum.RightHand, boneName: 'mixamorigRightHand' },
]