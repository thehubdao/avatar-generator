export enum IFrameEvent {
  Ready = 'ready',
  Subscribe = 'subscribe',
  Exported = 'exported',
  ChangeFeature = 'change',
  ChangeSkinColor = 'change_color',
}

export enum PageLocation {
  Admin = '/admin',
  Login = '/admin/login',
  FirstSteps = '/admin/firstSteps',
  AdminCampaign = '/admin/campaign',
  AssetCreate = '/admin/campaign/createAsset',
  Account = '/admin/account',
  UserControl = '/admin/account/userControl'
}

export enum Breadcrumb {
  Login = 'login',
  FirstSteps = 'firstSteps',
  AdminCampaign = 'campaign',
  AssetCreate = 'createAsset',
  Account = 'account',
  Missing = 'missingPage',
  UserControl = 'userControl',
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
  CollectionUtil = 'CollectionUtil',
  Single = 'SingleComponent',
  TextureUtil = 'TextureUtil',
  EditCampaign = 'EditCampaignComponent',
  OptionSelector = 'OptionSelector',
  Importer = "ThreeJsImporterUtil",
  Lukso = 'LuksoComponent',
  VrmUtil = "VrmUtil",
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
  Random = 'r_val',
  Config = 'Config',
  All = '',
  Missing = 'NaN',
}

export enum RandomTier {
  Common = "c",
  Rare = "r",
  Epic = "e",
}

/***
 * Way to code errors that use the result type, `AG-` start on all own errors 
 * 100 - Api errors
 * 200 - Data functions
 * 300 - Firebase request
 * */
export const enum CommonErrorCode {
  GetNoData = 'AG-107',
  FetchError = 'AG-103',
  PostNoData = 'AG-108',
  MissingInfo = 'AG-201',
  WrongInfo = 'AG-202',
  InternalError = 'AG-205',
  NoAuth = 'AG-301'
}