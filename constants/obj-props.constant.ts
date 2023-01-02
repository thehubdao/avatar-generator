import {ObjProp} from "../interfaces/common.interface";

export const FeatureInterfaceProps: ObjProp[] = [
  {prop: 'type'},
  {prop: 'name'},
  {prop: 'path'},
  {prop: 'thumb'},
];

export const AccessoryInterfaceProps: ObjProp[] = [
  {prop: 'type'},
  {prop: 'name'},
  {prop: 'path'},
  {prop: 'thumb'},
];

export const AnimationInterfaceProps: ObjProp[] = [
  {prop: 'name'},
  {prop: 'path'},
  {prop: 'thumb'},
];

export const CampaignInterfaceProps: ObjProp[] = [
  {prop: 'armature'},
  {prop: 'features'},
  {prop: 'accessories'},
  {prop: 'config'},
];