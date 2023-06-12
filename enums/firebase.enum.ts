export enum FirestoreLocation {
    Features = 'features',
    Accessories = 'accessories',
    Animations = 'animations',
    Environments = 'environments',
    EnvMaps = 'env_maps',
    Parameters = '/',
}

export enum FirestoreGlobalLocation {
    Parameters = 'general/parameters',
    User = 'user',
    Campaign = 'campaign',
    ParametersV2 = 'general/parametersV2',
}

export enum FirestoreParameters {
    Campaigns = 'campaigns'
}

export enum StorageLocation {
    Accessory = 'accessory',
    AvatarBase = 'avatar_base',
    Feature = 'feature',
    Thumbnail = 'thumb',
    Animation = 'animation',
    Missing = 'missing',
    Environment = 'environment',
    EnvMap = 'env_map',
}

export enum FirestoreFilterValues {
    Type = 'type',
    Name = 'name',
    Campaign = 'campaign',
}

export enum UserRoleValues {
    superAdmin = 0,
    admin = 1,
}

export enum AuthValues {
    DefaultEmail = '@freakground.com',
}