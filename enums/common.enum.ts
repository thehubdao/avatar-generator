export const enum GlobalValues {
  BaseCampaign = 'decentraland',
  Acc = 'Accessories',
  Config = 'Config',
  AccEnd = 'Acc',
  AccGroup = 'Accessories.AG',
  AvatarBase = 'base_mesh/MetaAvatarHub.glb',
  CollectorIndexSeparator = '_',
  EnvironmentId = 'environment',
}

export enum ExportAttributeValues {
  Campaign = 'campaign',
}

export enum ViewModuleState {
  SwitchingModule,
  OnModule
}

export enum IFrameValues {
  Project = 'avatar-generator',
  Event = 'message',
}

export enum IFrameEvents {
  Ready = 'ready',
  Subscribe = 'subscribe',
  Exported = 'exported',
  ChangeFeature = 'change',
  ChangeSkinColor = 'change_color',
}

export enum PageLocation {
  Admin = '/admin',
  AssetList = '/admin/assets/list',
  Login = '/admin/login',
  FirstSteps = '/admin/firstSteps',
}

export enum AdminComponents {
  AssetAdd,
  AssetList,
  AssetModify,
  UserAdd,
  UserList,
  CampaignAdd,
}

export enum Module {
  FirebaseUtil = 'FirebaseUtil',
  AssetAdd = 'AssetAdd',
  AvatarGenerator = 'AvatarGenerator',
  ModelUtil = 'ModelUtil',
  UserAdd = 'UserAdd',
  ApiUtil = 'ApiUtil',
  CampaignAdd = 'CampaignAdd',
  AnimationUtil = 'AnimationUtil',
  Viewer = 'ThreeViewer',
  Editor = 'AvatarEditor',
  CommonUtil = 'CommonUtil',
  CollectionComponent = 'CollectionComponent',
  ExporterUtil = 'ExporterUtil',
}

export enum EmailResult {
  NoEmail,
  BadEmail,
  GoodEmail,
}

export enum CampaignParameterName {
  Owner = 'owner',
  Armature = 'armature',
  Features = 'features',
  Accessories = 'accessories',
  Config = 'Config',
  All = '',
  Missing = 'NaN',
}