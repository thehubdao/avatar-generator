export enum GlobalValues {
  BaseCampaign = 'base',
  Acc = 'Accessories',
  Config = 'Config',
  AccEnd = 'Acc',
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
  NewCampaign,
}

export enum Module {
  FirebaseUtil = 'FirebaseUtil',
  AssetAdd = 'AssetAdd',
  AvatarGenerator = 'AvatarGenerator',
  ModelUtil = 'ModelUtil',
  UserAdd = 'UserAdd',
  ApiUtil = 'ApiUtil',
}

export enum EmailResult {
  NoEmail,
  BadEmail,
  GoodEmail,
}