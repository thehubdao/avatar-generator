export enum FirestoreLocation {
    Features = 'features',
    Accessories = 'accessories',
    Animations = 'animations',
    Parameters = 'general/parameters',
    User = 'user',
    Test = 'testing/YEP',
}

export enum FirestoreParameters {
    Campaigns = 'campaign'
}

export enum StorageLocation {
    Accessory = 'accessory',
    BaseMesh = 'base_mesh',
    Part = 'section',
    Thumbnail = 'thumb',
    Animation = 'animation',
    Missing = 'missing',
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