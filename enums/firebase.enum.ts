export enum FirestoreLocation {
    Features = 'parts',
    Accessories = 'accessories',
    Animations = 'animations',
    Parameters = '/',
}

export enum FirestoreGlobalLocation {
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

export enum AuthError {
    EmailInUse = 'auth/email-already-in-use',
}

export enum AuthValues {
    DefaultEmail = '@freakground.com',
}