import {FirebaseApp, FirebaseOptions} from "@firebase/app";
import {Firestore, QueryConstraint} from "@firebase/firestore";
import {FirebaseStorage} from "@firebase/storage";
import {Auth, User, UserCredential} from "@firebase/auth";
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
import {AddOrRemoveSlash, LogError, Raise, RandomPassword} from "./common.util";
import {Result} from "../types/common.type";
import {ConvertObject, ConvertType} from "./common/object-converter.util";
import {SessionUserInfo} from "./common/session.util";
import {CampaignParameters} from "../interfaces/common.interface";
import {ParameterNameType} from "../types/firebase.type";
import {COLLECTION_VALUES} from "../server/constants/collection.constant";

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

export async function GetInfoDB<T>(dbLocation: FirestoreLocation | FirestoreGlobalLocation | string, campaign?: string, constraintsValues?: AGQueryConstraints): Promise<Result<T[]>> {
  const newLocation = campaign != undefined ?
    `${FirestoreGlobalLocation.Campaign}/${campaign.toLowerCase()}${AddOrRemoveSlash(dbLocation)}` :
    dbLocation;

  if (newLocation.split('/').length % 2 === 0) {
    return GetDocument<T>(newLocation);
  } else {
    return GetDocuments<T>(newLocation, constraintsValues);
  }
}

async function GetDocument<T>(dbLocation: string): Promise<Result<T[]>> {
  try {
    const {doc, getDoc} = await import('@firebase/firestore');
    const docRef = doc(await FirebaseUtil.Instance().DB(), dbLocation);
    const leDoc = await getDoc(docRef);

    const data = leDoc.data() as T;

    return {success: true, value: data ? [data] : []};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

async function GetDocuments<T>(dbLocation: string, constraintsValues?: AGQueryConstraints): Promise<Result<(T & {id: string})[]>> {
  try {
    const constraints = await GetConstraints(dbLocation, constraintsValues);

    const {collection, getDocs, query} = await import('@firebase/firestore');

    const myQuery = query(collection(await FirebaseUtil.Instance().DB(), dbLocation), ...constraints);
    const querySnapshot = await getDocs(myQuery);

    const data = querySnapshot.docs.map(s => {
      return {id: s.id, ...s.data() as T};
    });
    
    return {success: true, value: data};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function GetSingleDocument<T>(dbLocation: FirestoreLocation | FirestoreGlobalLocation | string, docId: string): Promise<Result<T>> {
  if (!docId) return {success: false, errMessage: "Missing a valid docId!", errCode: CommonErrorCode.MissingInfo};
  if (dbLocation.split('/').length % 2 === 0)
    return {success: false, errMessage: "Location is not a collection!", errCode: CommonErrorCode.WrongInfo};

  try {
    const {doc, getDoc} = await import('@firebase/firestore');
    const docRef = doc(await FirebaseUtil.Instance().DB(), `${dbLocation}/${docId}`);
    const leDoc = await getDoc(docRef);

    const data = leDoc.data() as T;
    return data == undefined ?
      {success: false, errMessage: "Missing data on collection!", errCode: CommonErrorCode.MissingInfo} :
      {success: true, value: data};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
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
    case COLLECTION_VALUES.Suffix:
      return CollectionConstraints(constraintsValues);
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

async function CollectionConstraints(constraintsValues: AGQueryConstraints) {
  const constraints: QueryConstraint[] = [];
  const {collectionStatus} = constraintsValues;
  const {where} = await import('@firebase/firestore');
  
  if (collectionStatus != undefined)
    constraints.push(where(FirestoreFilterValues.CollectionStatus, "==", collectionStatus));

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

export async function GetParameter<T>(campaign: string | undefined, parameter: ParameterNameType): Promise<Result<T>> {
  try {
    if (parameter === CampaignParameterName.Missing) Raise("Non existent parameter wanted!");

    const {doc, getDoc} = await import('@firebase/firestore');

    const realLocation = campaign ? `${FirestoreGlobalLocation.Campaign}/${campaign}`.toLowerCase() : FirestoreGlobalLocation.ParametersV2;
    const docRef = doc(await FirebaseUtil.Instance().DB(), realLocation);
    const leDoc = await getDoc(docRef);
    
    const data = parameter === CampaignParameterName.All ?
      leDoc.data() as T :
      leDoc.get(parameter) as T;
    
    return data == undefined ?
      {success: false, errMessage: "Empty data on db!", errCode: CommonErrorCode.GetNoData} :
      {success: true, value: data};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, e);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function GetParameters<T>(campaign?: string, ...parameters: ParameterNameType[]): Promise<T[]> {
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
      location !== FirestoreLocation.Parameters ?
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
  const authFirebase = await FirebaseUtil.Instance().Auth();
  return new Promise<User | null>((resolve) => {
    authFirebase.onAuthStateChanged((user) => {
      resolve(user);
    });
  });
}

export async function GetFileUrl(filePath?: string): Promise<Result<string>> {
  if(filePath == undefined || filePath === '') {
    const msg = "Missing firebase path to get file URL!";
    void LogError(Module.FirebaseUtil, msg);
    return {success: false, errCode: CommonErrorCode.MissingInfo, errMessage: msg};
  }
    
  try {
    const {ref, getDownloadURL} = await import('@firebase/storage');

    const fileRef = ref(await FirebaseUtil.Instance().Storage(), filePath);
    const fileUrl = await getDownloadURL(fileRef);

    return { success: true, value: fileUrl};
  }
  catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message);
    return {success: false, errCode: err.code, errMessage: err.message};
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
  
  if (!userDoc.success)
    return undefined;

  return userDoc.value[0];
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

export async function GetUserList(): Promise<Result<UserInterface[]>> {
  try {
    return GetInfoDB<UserInterface>(FirestoreGlobalLocation.User);
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error while retrieving UserList: ${err.message}`);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function GetCollectionList(dbLocation: string | FirestoreGlobalLocation) {
  const {collection, getDocs} = await import('@firebase/firestore');

  const querySnapshot = await getDocs(collection(await FirebaseUtil.Instance().DB(), dbLocation));
  return querySnapshot.docs.map(s => {
    return s.id
  });
}

export async function UpdateAdminCampaigns(): Promise<Result<boolean>> {
  try {
    const {doc, setDoc} = await import('@firebase/firestore');

    const adminId = process.env.AG_ADMIN_ID ?? Raise("Missing AdminId on env variables!");

    const adminDocLocation = `${FirestoreGlobalLocation.User}/${adminId}`;
    const docRef = doc(await FirebaseUtil.Instance().DB(), adminDocLocation);

    // Get admin account base on role and last update
    // const adminDoc = (await getDoc(docRef)).data() as AdminUser;

    // Get the whole list of campaigns in db as a string array
    const campaignList = await GetCollectionList(FirestoreGlobalLocation.Campaign);
    
    // Update this account with the new data
    const data: Partial<AdminUser> = {
      campaign: [...campaignList],
      lastUpdate: Date.now(),
    };
    await setDoc(docRef, data, {merge: true});

    const newParams: AGParameters = {
      campaigns: campaignList,
    };
    await UpdateDocObject(FirestoreGlobalLocation.ParametersV2, newParams);
    
    return {success: true, value: true};
  }
  catch (e) {
    const msg = "Error updating admin campaigns!";
    void LogError(Module.FirebaseUtil, msg, e);
    return {success: false, errMessage: msg, errCode: CommonErrorCode.InternalError};
  }
}

export async function UpdateCampaignParameter(update: Partial<CampaignParameters>, campaign: string) {
  return await UpdateDocObject(FirestoreLocation.Parameters, update, campaign);
}

async function DeleteDocument(docLocation: string): Promise<Result<string>> {
  try {
    const {doc, deleteDoc} = await import('@firebase/firestore');
    const leDoc = doc(await FirebaseUtil.Instance().DB(), docLocation);
    
    await deleteDoc(leDoc);
    return {success: true, value: leDoc.id};
  } catch (err) {
    const error = err as FirebaseError;
    void LogError(Module.FirebaseUtil, error.message, error.code);
    return {success: false, errMessage: error.message, errCode: error.code};
  }
}

export async function DeleteCampaign(campaign: string): Promise<Result<string>> {
  try {
    // Remove campaign from user
    const currentUser = await GetCurrentUser();
    if (currentUser == null)
      return {success: false, errMessage: "No user authenticated right now!", errCode: CommonErrorCode.NoAuth};
    
    const {doc, getDoc, setDoc} = await import('@firebase/firestore');

    const userLocation = `${FirestoreGlobalLocation.User}/${currentUser.uid}`;
    const userDocRef = doc(await FirebaseUtil.Instance().DB(), userLocation);

    // Get user account base on role and last update
    const adminDoc = (await getDoc(userDocRef)).data() as UserInterface;
    const newData: Partial<UserInterface> = {
      campaign: adminDoc.campaign.filter(c => c.toLowerCase() !== campaign.toLowerCase())
    };

    await setDoc(userDocRef, newData, {merge: true});

    // Delete document (lowercase needed cuz reasons)
    const campaignLocation = `${FirestoreGlobalLocation.Campaign}/${campaign.toLowerCase()}`;
    return DeleteDocument(campaignLocation);
  }
  catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function BatchSet(prefix: string, allItems: ({id: string | number} & object)[]): Promise<Result<number>> {
  try {
    if (allItems.length === 0) return {success: true, value: 0};

    const highLimit = allItems.length > 500 ? 500 : allItems.length;
    const {writeBatch, doc} = await import("@firebase/firestore");
    const dbRef = await FirebaseUtil.Instance().DB();

    let batch = writeBatch(dbRef);
    let limit = 0;
    let done = 0;

    for (const item of allItems) {
      const itemRef = doc(dbRef, `${prefix}/${item.id}`);
      batch.set(itemRef, item);
      limit++;

      if (limit >= highLimit) {
        await batch.commit();
        batch = writeBatch(dbRef);
        done += limit;
        limit = 0;
      }
    }

    return {success: true, value: done};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function BatchUpdate(prefix: string, allItems: [string | number, object][]): Promise<Result<number>> {
  try {
    if (allItems.length === 0) return {success: true, value: 0};

    const highLimit = allItems.length > 500 ? 500 : allItems.length;
    const {writeBatch, doc} = await import("@firebase/firestore");
    const dbRef = await FirebaseUtil.Instance().DB();

    let batch = writeBatch(dbRef);
    let limit = 0;
    let done = 0;

    for (const [key, item] of allItems) {
      const itemRef = doc(dbRef, `${prefix}/${key}`);
      batch.update(itemRef, item);
      limit++;

      if (limit >= highLimit) {
        await batch.commit();
        batch = writeBatch(dbRef);
        done += limit;
        limit = 0;
      }
    }

    return {success: true, value: done};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}

export async function BatchDelete(prefix: string, allItems: (string | number)[]): Promise<Result<number>> {
  try {
    if (allItems.length === 0) return {success: true, value: 0};
    
    const highLimit = allItems.length > 500 ? 500 : allItems.length;
    const {writeBatch, doc} = await import("@firebase/firestore");
    const dbRef = await FirebaseUtil.Instance().DB();

    let batch = writeBatch(dbRef);
    let limit = 0;
    let done = 0;

    for (const key of allItems) {
      const itemRef = doc(dbRef, `${prefix}/${key}`);
      batch.delete(itemRef);
      limit++;

      if (limit >= highLimit) {
        await batch.commit();
        batch = writeBatch(dbRef);
        done += limit;
        limit = 0;
      }
    }

    return {success: true, value: done};
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return {success: false, errMessage: err.message, errCode: err.code};
  }
}