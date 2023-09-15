import {FirebaseApp, FirebaseOptions} from "@firebase/app";
import {Firestore, QueryConstraint} from "@firebase/firestore";
import {FirebaseStorage} from "@firebase/storage";
import {Auth, UserCredential} from "@firebase/auth";
import {FirebaseError} from "@firebase/util";

import {
  AuthValues,
  FirestoreFilterValues,
  FirestoreGlobalLocation,
  FirestoreLocation,
  StorageLocation
} from "../enums/firebase.enum";
import {
  AdminUser,
  AGParameters,
  AGQueryConstraints,
  LogInInterface,
  UserInterface,
  UserWithPass
} from "../interfaces/firebase.interface";
import {CampaignParameterName, CommonErrorCode, Module, PageLocation} from "../enums/common.enum";
import {GoToPage} from "./router.util";
import {AddOrRemoveSlash, LogError, RandomPassword} from "./common.util";
import {Result} from "../types/common.type";
import {ConvertObject, ConvertType} from "./common/object-converter.util";
import {SessionUserInfo} from "./common/session.util";
import {ParameterNameType} from "../types/firebase.type";
import {CampaignParameters} from "../interfaces/common.interface";

class FirebaseUtil {
  private static _instance: FirebaseUtil;
  private _app: FirebaseApp | null;
  private _db: Firestore | null;
  private _storage: FirebaseStorage | null;
  private _auth: Auth | null;

  constructor() {
    this._app = null;
    this._db = null;
    this._storage = null;
    this._auth = null;
  }

  public static Instance() {
    if (FirebaseUtil._instance === undefined)
      FirebaseUtil._instance = new FirebaseUtil();

    return FirebaseUtil._instance;
  }

  public async App() {
    // console.log('App: ', !!this._app);
    if (this._app === null) {
      const config: FirebaseOptions = {
        appId: process.env.NEXT_PUBLIC_FB_APP_ID,
        apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
        messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
        storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
      }
      const {initializeApp} = await import('@firebase/app');
      this._app = initializeApp(config);
    }

    return this._app;
  }

  public async DB() {
    const checked = CheckServerSide();
    // console.log('DB: ', !!this._db);
    if (this._db === null) {
      const {getFirestore} = await import('@firebase/firestore');
      this._db = getFirestore(await this.App());
    }

    await checked;
    return this._db;
  }

  public async Storage() {
    const checked = CheckServerSide();
    // console.log('Storage: ', !!this._storage);
    if (this._storage === null) {
      const {getStorage} = await import('@firebase/storage');
      this._storage = getStorage(await this.App());
    }

    await checked;
    return this._storage;
  }

  public async Auth() {
    // console.log('Auth: ', !!this._auth);
    if (this._auth === null) {
      const {getAuth} = await import('@firebase/auth');
      this._auth = getAuth(await this.App());
    }

    return this._auth;
  }
}

async function CheckServerSide() {
  // server side
  if (typeof window === 'undefined') {
    await FirebaseUtil.Instance().Auth();

    if (!(process.env.AG_FB_USER && process.env.AG_FB_PASS)) {
      console.error("Missing Firebase Server Account, please upload this params and redeploy the app.")
      return;
    }

    if (await IsNotLogIn()) {
      const logInfo: LogInInterface = {
        user: process.env.AG_FB_USER,
        pass: process.env.AG_FB_PASS,
      };
      await LogIn(logInfo);
    }
  }
}

export async function GetInfoDB<T>(dbLocation: FirestoreLocation | FirestoreGlobalLocation | string, campaign?: string, constraintsValues?: AGQueryConstraints) {
  const newLocation = campaign != undefined ?
    `${FirestoreGlobalLocation.Campaign}/${campaign.toLowerCase()}${AddOrRemoveSlash(dbLocation)}` :
    dbLocation;

  if (newLocation.split('/').length % 2 === 0) {
    return GetDocument<T>(newLocation);
  } else {
    return GetDocuments<T>(newLocation, constraintsValues);
  }
}

async function GetDocument<T>(dbLocation: string) {
  const {doc, getDoc} = await import('@firebase/firestore');
  const docRef = doc(await FirebaseUtil.Instance().DB(), dbLocation);
  const leDoc = await getDoc(docRef);

  const data = leDoc.data() as T;
  return data ? [data] : [];
}

async function GetDocuments<T>(dbLocation: string, constraintsValues?: AGQueryConstraints) {
  const constraints = await GetConstraints(dbLocation, constraintsValues);

  const {collection, getDocs, query} = await import('@firebase/firestore');

  const myQuery = query(collection(await FirebaseUtil.Instance().DB(), dbLocation), ...constraints);
  const querySnapshot = await getDocs(myQuery);

  return querySnapshot.docs.map(s => {
    return {...s.data() as T, id: s.id}
  });
}

function GetConstraints(dbLocation: string, constraintsValues?: AGQueryConstraints) {
  if (!constraintsValues)
    return [];

  const location = dbLocation.split('/').pop();

  switch (location) {
    case FirestoreLocation.Features:
      return FeatureConstraints(constraintsValues);
    case FirestoreLocation.Accessories:
      return AccessoryConstraints(constraintsValues);
    case FirestoreLocation.Animations:
      return AnimationConstraints(constraintsValues);
    default:
      return [];
  }
}

async function FeatureConstraints(constraintsValues: AGQueryConstraints) {
  const constraints: QueryConstraint[] = [];
  const {type, campaign} = constraintsValues;
  const {orderBy, where} = await import('@firebase/firestore');

  if (campaign)
    constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

  if (type)
    constraints.push(where(FirestoreFilterValues.Type, "==", type));

  constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

  return constraints;
}

async function AccessoryConstraints(constraintsValues: AGQueryConstraints) {
  const constraints: QueryConstraint[] = [];
  const {type, campaign} = constraintsValues;
  const {orderBy, where} = await import('@firebase/firestore');
  
  if (campaign)
    constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

  if (type)
    constraints.push(where(FirestoreFilterValues.Type, "==", type));

  constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

  return constraints;
}

async function AnimationConstraints(constraintsValues: AGQueryConstraints) {
  const constraints: QueryConstraint[] = [];
  const {campaign, name} = constraintsValues;
  const {orderBy, where} = await import('@firebase/firestore');

  if (campaign)
    constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

  if (name)
    constraints.push(where(FirestoreFilterValues.Name, "==", name));
  else
    constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

  return constraints;
}

export async function GetFile(path: string, campaign?: string): Promise<Result<ArrayBuffer>> {
  try {
    const {getBlob, ref} = await import('@firebase/storage');
    const campaignSection = campaign ? `${campaign.toLowerCase()}/` : '';
    const baseMeshRef = ref(await FirebaseUtil.Instance().Storage(), campaignSection + path);

    // // Server Side
    // const stream = await getStream(baseMeshRef);
    // return stream;

    const stream = await getBlob(baseMeshRef);
    return {success: true, value: await stream.arrayBuffer()};
  }
  catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, e);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function GetParameter<T>(campaign: string | undefined, parameter: ParameterNameType): Promise<T | undefined> {
  if(parameter === CampaignParameterName.Missing) return undefined;

  const {doc, getDoc} = await import('@firebase/firestore');

  const realLocation = campaign ? `${FirestoreGlobalLocation.Campaign}/${campaign}`.toLowerCase() : FirestoreGlobalLocation.ParametersV2;
  const docRef = doc(await FirebaseUtil.Instance().DB(), realLocation);
  const leDoc = await getDoc(docRef);

  if (parameter !== CampaignParameterName.All) {
    return leDoc.get(parameter) as T;
  } else {
    return leDoc.data() as T;
  }
}

export async function GetParameters<T>(campaign?: string, ...parameters: (string | CampaignParameterName)[]): Promise<T[]> {
  const {doc, getDoc} = await import('@firebase/firestore');

  const realLocation = campaign ? `${FirestoreGlobalLocation.Campaign}/${campaign.toLowerCase()}` : FirestoreGlobalLocation.Parameters;
  const docRef = doc(await FirebaseUtil.Instance().DB(), realLocation);
  const leDoc = await getDoc(docRef);

  const result: T[] = [];
  for (const parameter of parameters) {
    if (parameter !== CampaignParameterName.All) {
      result.push(leDoc.get(parameter) as T);
    } else {
      result.push(leDoc.data() as T);
    }
  }

  return result;
}

function CampaignLocation(campaign?: string) {
  return campaign ? `${FirestoreGlobalLocation.Campaign}/${campaign.toLowerCase()}/` : '';
}

export async function UpdateDoc(jsonData: string, location: FirestoreLocation, campaign?: string) {
  return UpdateDocObject(location, JSON.parse(jsonData) as object, campaign);
}

export async function UpdateDocObject(location: FirestoreLocation | FirestoreGlobalLocation, data: object | null, campaign?: string, docName?: string): Promise<Result<boolean>> {
  const {doc, setDoc} = await import('@firebase/firestore');

  try {
    const newLocation = campaign ?
      `${FirestoreGlobalLocation.Campaign}/${campaign.toLowerCase()}${AddOrRemoveSlash(location)}` :
      location !== '/' ?
        location :
        FirestoreGlobalLocation.Parameters;
    const newDocName = docName == undefined ? '' : `/${docName}`;

    // eslint-disable-next-line no-console
    console.log('Update doc loc', newLocation, newDocName);
    const docRef = doc(await FirebaseUtil.Instance().DB(), `${newLocation}${newDocName}`);
    await setDoc(docRef, data, {merge: true});
    return {success: true, value: true};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error updating doc: ${docName ?? '--'}, errMessage: ${err.message}`);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function DeleteDoc(location: FirestoreLocation, docId: string, campaign?: string) {
  const {deleteDoc, doc} = await import('@firebase/firestore');
  
  await deleteDoc(doc(await FirebaseUtil.Instance().DB(), `${CampaignLocation(campaign)}${location}/${docId}`))
  return docId;
}

export async function ReplaceDoc(docLocation: string, jsonData?: string, campaign?: string) {
  if (jsonData) {
    const {doc, updateDoc} = await import('@firebase/firestore');
    const newLocation = campaign ?
      campaign.toLowerCase() + docLocation :
      docLocation !== '/' ?
        docLocation :
        FirestoreGlobalLocation.Parameters;

    const docRef = doc(await FirebaseUtil.Instance().DB(), newLocation);
    await updateDoc(docRef, JSON.parse(jsonData));
  }
}

export async function InsertDoc(jsonData: string, location: string = FirestoreLocation.Features, campaign?: string): Promise<Result<string>> {
  return InsertDocObj(JSON.parse(jsonData) as object, location, campaign);
}

export async function InsertDocObj(data: object, location: string | FirestoreLocation | FirestoreGlobalLocation, campaign?: string): Promise<Result<string>> {
  const {addDoc, collection} = await import('@firebase/firestore');

  try {
    const newDoc = await addDoc(
      collection(await FirebaseUtil.Instance().DB(), CampaignLocation(campaign) + location),
      data);

    return {success: true, value: newDoc.id};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error creating doc, at ${location} with err message: ${err.message}`);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function InsertDocWithId(newDocId: string, data: object, location: FirestoreLocation | FirestoreGlobalLocation, campaign?: string, lowerCase = true): Promise<Result<string>> {
  const {setDoc, doc} = await import('@firebase/firestore');

  try {
    const docName = lowerCase ? newDocId.trim().toLowerCase() : newDocId.trim();
    const newDoc = doc(await FirebaseUtil.Instance().DB(), CampaignLocation(campaign) + location, docName);
    await setDoc(newDoc, data);
    return {success: true, value: newDocId};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error creating doc: ${newDocId}, at ${location} with message: ${err.message}`);
    return {success: false, errCode: err.code, errMessage: err.message};
  }
}

export async function UploadFile(file: File | null | undefined, fileType: StorageLocation, sectionType?: string, campaign?: string) {
  if (file == null) return void LogError(Module.FirebaseUtil, "Missing file to upload");

  const {ref, uploadBytes} = await import('@firebase/storage');
  const {uuidv4} = await import('@firebase/util');

  const campaignSection = campaign ? `${campaign.toLowerCase()}/` : '';
  const realSection = sectionType ? '/' + sectionType.toLowerCase().replace('acc', '') : '';
  const newName = uuidv4();

  const fileRef = ref(await FirebaseUtil.Instance().Storage(), `${campaignSection}${fileType}${realSection}/${newName}`);
  const log = await uploadBytes(fileRef, file);

  return log.metadata.fullPath;
}

export async function LogIn(credentials: LogInInterface) {
  if (!(credentials.pass && credentials.user))
    return;

  const {signInWithEmailAndPassword} = await import('@firebase/auth');

  let actualUser = credentials.user;
  if (!credentials.user.includes('@')) {
    actualUser = `${credentials.user}${AuthValues.DefaultEmail}`;
  }

  return signInWithEmailAndPassword(await FirebaseUtil.Instance().Auth(), actualUser, credentials.pass);
}

export async function IsLogIn(): Promise<boolean> {
  const authFirebase = await FirebaseUtil.Instance().Auth(); 
  return new Promise<boolean>(resolve => {
    authFirebase.onAuthStateChanged((user) => {
      user != null ? resolve(true) : resolve(false);
    });
  });
}

export async function IsNotLogIn() {
  return !(await IsLogIn());
}

export async function LogOut() {
  const {signOut} = await import('@firebase/auth');
  
  void signOut(await FirebaseUtil.Instance().Auth())
    .then(async () => {
      await GoToPage(PageLocation.Login);
    });
}

export async function GetCurrentUser() {
  return (await FirebaseUtil.Instance().Auth()).currentUser;
  
  // return new Promise<User | null>(async (resolve) => {
  //   (await FirebaseUtil.Instance().Auth()).onAuthStateChanged((user) => {
  //     resolve(user);
  //   })
  // });
}

export async function GetFileUrl(imagePath?: string) {
  if(imagePath == undefined || imagePath === '')
    return void LogError(Module.FirebaseUtil, "Missing image location");
  
  try {
    const {ref, getDownloadURL} = await import('@firebase/storage');

    const imageRef = ref(await FirebaseUtil.Instance().Storage(), imagePath);
    return getDownloadURL(imageRef);
  }
  catch (e) {
    const err = e as FirebaseError;
    console.error(`Error getting Image Url. ${err.message}`);
    return undefined;
  }
}

export async function HandleNotLoggedIn() {
  const isNotLogIn = await IsNotLogIn();

  if (isNotLogIn) {
    await GoToPage(PageLocation.Login);
  }

  return isNotLogIn;
}

export async function GetUserInfo(userUid: string) {
  const userLocation = `${FirestoreGlobalLocation.User}/${userUid}`;
  const userDoc = await GetDocument<UserInterface>(userLocation);

  if (userDoc.length === 0)
    return undefined;

  return userDoc[0];
}

export async function GetCurrentUserInfo(forceUpdate = false) {
  const currentUser = await GetCurrentUser();
  
  if (currentUser)
    return SessionUserInfo(currentUser.uid, forceUpdate);
  
  return undefined;
}

export async function CreateNewUser(newUser: Partial<UserWithPass>): Promise<Result<boolean>> {
  if (newUser.email == undefined) {
    void LogError(Module.FirebaseUtil, "Missing email on create user!");
    return {success: false, errMessage: 'Missing email on create user!', errCode: CommonErrorCode.MissingInfo};
  }

  const {createUserWithEmailAndPassword, updateCurrentUser} = await import('@firebase/auth');
  let result: Result<boolean>;
  let leUser: UserCredential | undefined;

  // Create user
  try {
    const originalUser = await GetCurrentUser();

    leUser = await createUserWithEmailAndPassword(
      await FirebaseUtil.Instance().Auth(),
      newUser.email,
      newUser.password == undefined || newUser.password === '' ? RandomPassword() : newUser.password);

    await updateCurrentUser(await FirebaseUtil.Instance().Auth(), originalUser);
    result = {success: true, value: true};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error on create User: ${err.message}`);
    result = {success: false, errMessage: `Error on create User: ${err.message}`, errCode: err.code};
    return result;
  }

  // Save user info on db
  if (leUser != undefined) {
    const realUser = ConvertObject<UserInterface>(newUser, ConvertType.UserInterface);
    const insertedDoc = await InsertDocWithId(leUser.user.uid, realUser, FirestoreGlobalLocation.User, undefined, false);

    if (!insertedDoc.success) {
      const {deleteUser} = await import('@firebase/auth');

      try {
        await deleteUser(leUser.user);
      } catch (e) {
        const err = e as FirebaseError;
        const errMessage = `Error deleting wrongfully created auth account. Error: ${err.message}`;
        void LogError(Module.FirebaseUtil, errMessage);
        return {success: false, errMessage, errCode: err.code};
      }

      return {success: false, errMessage: insertedDoc.errMessage, errCode: insertedDoc.errCode};
    }
  }

  // Reset password
  if (result.success) {
    const {sendPasswordResetEmail} = await import('@firebase/auth');

    try {
      await sendPasswordResetEmail(await FirebaseUtil.Instance().Auth(), newUser.email);
    } catch (e) {
      const err = e as FirebaseError;
      void LogError(Module.FirebaseUtil, `Error resetting password for account ${newUser.email}`);
      result = {
        success: false,
        errMessage: `Error resetting password for account ${newUser.email}: ${err.message}`,
        errCode: err.code
      };
      return result;
    }
  }

  // Return errors to view
  return result;
}

export async function GetUserList() {
  try {
    return GetInfoDB<UserInterface>(FirestoreGlobalLocation.User);
  } catch (e) {
    const err = e as FirebaseError;
    return LogError(Module.FirebaseUtil, `Error while retrieving UserList: ${err.message}`);
  }
}

export async function GetCollectionList(dbLocation: string | FirestoreGlobalLocation) {
  const {collection, getDocs} = await import('@firebase/firestore');

  const querySnapshot = await getDocs(collection(await FirebaseUtil.Instance().DB(), dbLocation));
  return querySnapshot.docs.map(s => {
    return s.id
  });
}

// TODO: add try/catch with return response
export async function UpdateAdminCampaigns() {
  const {doc, setDoc, getDoc, Timestamp} = await import('@firebase/firestore');

  const adminId = process.env.AG_ADMIN_ID;
  if (adminId == undefined)
    return void LogError(Module.FirebaseUtil, "Missing AdminId on env variables!");
    
  const adminDocLocation = `${FirestoreGlobalLocation.User}/${adminId}`;
  const docRef = doc(await FirebaseUtil.Instance().DB(), adminDocLocation);

  // Get admin account base on role and last update
  const adminDoc = (await getDoc(docRef)).data() as AdminUser;

  // Get the whole list of campaigns in db as a string array
  const campaignList = await GetCollectionList(FirestoreGlobalLocation.Campaign);

  // Update this account with the new data
  const data: Partial<AdminUser> = {
    campaign: [...new Set([...adminDoc.campaign, ...campaignList])],
    lastUpdate: Timestamp.now(),
  };
  await setDoc(docRef, data, {merge: true});

  const newParams: AGParameters = {
    campaigns: campaignList,
  };
  await UpdateDocObject(FirestoreGlobalLocation.ParametersV2, newParams);
}

export async function UpdateCampaignParameter(update: Partial<CampaignParameters>, campaign: string) {
  return await UpdateDocObject(FirestoreLocation.Parameters, update, campaign);
}