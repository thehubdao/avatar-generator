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
  FirestoreParameters,
  StorageLocation
} from "../enums/firebase.enum";
import {AGQueryConstraints, LogInInterface, UserInterface} from "../interfaces/firebase.interface";
import {Module, PageLocation} from "../enums/common.enum";
import {GoToPage} from "./router.util";
import {LogError} from "./common.util";
import {Result} from "../interfaces/common.interface";

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
  let newLocation = dbLocation === '/' ? FirestoreGlobalLocation.Parameters : dbLocation;
  if (campaign)
    newLocation = `${FirestoreParameters.Campaigns}/${campaign}/${dbLocation}`;

  if (newLocation.split('/').length % 2 === 0) {
    return GetDocument<T>(newLocation);
  } else {
    return GetDocuments<T>(newLocation, constraintsValues);
  }
}

async function GetDocument<T>(dbLocation: FirestoreLocation | string) {
  const {doc, getDoc} = await import('@firebase/firestore');
  const docRef = doc(await FirebaseUtil.Instance().DB(), dbLocation);
  const leDoc = await getDoc(docRef);

  const data = leDoc.data() as T;
  return data ? [data] : [];
}

async function GetDocuments<T>(dbLocation: FirestoreLocation | string, constraintsValues?: AGQueryConstraints) {
  const constraints = await GetConstraints(dbLocation, constraintsValues);

  const {collection, getDocs, query} = await import('@firebase/firestore');

  const myQuery = query(collection(await FirebaseUtil.Instance().DB(), dbLocation), ...constraints);
  const querySnapshot = await getDocs(myQuery);

  return querySnapshot.docs.map(s => {
    return {...s.data() as T, id: s.id}
  });
}

function GetConstraints(dbLocation: FirestoreLocation | string, constraintsValues?: AGQueryConstraints) {
  if (!constraintsValues)
    return [];

  switch (dbLocation) {
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
  const {campaign} = constraintsValues;
  const {orderBy, where} = await import('@firebase/firestore');

  if (campaign)
    constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

  constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

  return constraints;
}

export async function GetFile(path: string, campaign?: string) {
  const {getBlob, ref} = await import('@firebase/storage');
  const campaignSection = campaign ? `${campaign}/` : '';
  const baseMeshRef = ref(await FirebaseUtil.Instance().Storage(), campaignSection + path);

  // // Server Side
  // const stream = await getStream(baseMeshRef);
  // return stream;

  const stream = await getBlob(baseMeshRef);
  return stream.arrayBuffer();
}

export async function GetParameters<T>(campaign?: string, ...parameters: string[]): Promise<T[]> {
  const {doc, getDoc} = await import('@firebase/firestore');

  const realLocation = campaign ? `${campaign}/${FirestoreLocation.Parameters}` : FirestoreGlobalLocation.Parameters;
  const docRef = doc(await FirebaseUtil.Instance().DB(), realLocation);
  const leDoc = await getDoc(docRef);

  const result: T[] = [];
  for (const parameter of parameters) {
    result.push(leDoc.get(parameter));
  }

  return result;
}

function CampaignLocation(campaign?: string) {
  return campaign ? `${campaign}/` : '';
}

export async function UpdateDoc(location: FirestoreLocation, jsonData: string, campaign?: string) {
  return UpdateDocObject(location, JSON.parse(jsonData), campaign);
}

export async function UpdateDocObject(location: FirestoreLocation | FirestoreGlobalLocation, data: {}, campaign?: string, docName?: string) {
  const {doc, setDoc} = await import('@firebase/firestore');
  const newLocation = campaign ?
    campaign + location :
    location !== '/' ?
      location :
      FirestoreGlobalLocation.Parameters;
  const newDocName = docName == undefined ? '' : `/${docName}`;

  const docRef = doc(await FirebaseUtil.Instance().DB(), newLocation + newDocName);
  return await setDoc(docRef, data, {merge: true});
}

export async function DeleteDoc(location: FirestoreLocation, docId: string, campaign?: string) {
  const {deleteDoc, doc} = await import('@firebase/firestore');
  const campaignLocation = campaign ? `${campaign}/` : '';
  await deleteDoc(doc(await FirebaseUtil.Instance().DB(), `${campaignLocation}${location}/${docId}`))
  return docId;
}

export async function ReplaceDoc(docLocation: string, jsonData?: string, campaign?: string) {
  if (jsonData) {
    const {doc, updateDoc} = await import('@firebase/firestore');
    const newLocation = campaign ?
      campaign + docLocation :
      docLocation !== '/' ?
        docLocation :
        FirestoreGlobalLocation.Parameters;

    const docRef = doc(await FirebaseUtil.Instance().DB(), newLocation);
    await updateDoc(docRef, JSON.parse(jsonData));
  }
}

export async function InsertDoc(jsonData: string, location: string = FirestoreLocation.Features, campaign?: string) {
  // console.log(jsonData);
  const {addDoc, collection} = await import('@firebase/firestore');
  const newDoc = await addDoc(
    collection(await FirebaseUtil.Instance().DB(), CampaignLocation(campaign) + location),
    JSON.parse(jsonData));
  // console.log('New Doc: ', newDoc.id);
}

export async function InsertDocWithId(newDocId: string, data: {}, location: FirestoreLocation | FirestoreGlobalLocation, campaign?: string): Promise<Result<string>> {
  const {setDoc, doc} = await import('@firebase/firestore');

  try {
    const newDoc = doc(await FirebaseUtil.Instance().DB(), CampaignLocation(campaign) + location, newDocId);
    await setDoc(newDoc, data);
    return {successful: true, value: newDocId};
  } catch (e) {
    const err = e as FirebaseError;
    LogError(Module.FirebaseUtil, `Error creating doc: ${newDocId}, at ${location} with message: ${err.message}`).then();
    return {successful: false, errCode: err.code, errMessage: err.message};
  }
}

export async function UploadFile(file: File, fileType: StorageLocation, sectionType?: string, campaign?: string) {
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

export async function IsLogIn() {
  return new Promise<boolean>(async (resolve) => {
    (await FirebaseUtil.Instance().Auth()).onAuthStateChanged((user) => {
      user ? resolve(true) : resolve(false);
    });
  });
}

export async function IsNotLogIn() {
  return !(await IsLogIn());
}

export async function LogOut() {
  const {signOut} = await import('@firebase/auth');
  signOut(await FirebaseUtil.Instance().Auth())
    .then(async () => {
      await GoToPage(PageLocation.Login);
    });
}

export async function GetCurrentUser() {
  return new Promise<User | null>(async (resolve) => {
    (await FirebaseUtil.Instance().Auth()).onAuthStateChanged((user) => {
      resolve(user);
    })
  });
}

export async function HandleNotLoggedIn() {
  const flag = await IsNotLogIn();

  if (flag)
    await GoToPage(PageLocation.Login);

  return flag;
}

export async function GetUserInfo(userUid: string) {
  const userLocation = `${FirestoreGlobalLocation.User}/${userUid}`;
  const userDoc = await GetDocument<UserInterface>(userLocation);

  if (userDoc.length === 0)
    return undefined;

  return userDoc[0];
}

export async function CreateNewUser(newUser: Partial<UserInterface>): Promise<Result<boolean>> {
  if (newUser.email == undefined) {
    LogError(Module.FirebaseUtil, "Missing email on create user!").then();
    return {successful: false, errMessage: 'Missing email on create user!'};
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
      RandomPassword());

    await updateCurrentUser(await FirebaseUtil.Instance().Auth(), originalUser);
    result = {successful: true, value: true};
  } catch (e) {
    const err = e as FirebaseError;
    LogError(Module.FirebaseUtil, `Error on create User: ${err.message}`).then();
    result = {successful: false, errMessage: `Error on create User: ${err.message}`, errCode: err.code};
  }

  // Save user info on db
  if (leUser != undefined)
    await InsertDocWithId(leUser.user.uid, newUser, FirestoreGlobalLocation.User);

  // Reset password
  if (result.successful) {
    const {sendPasswordResetEmail} = await import('@firebase/auth');

    try {
      await sendPasswordResetEmail(await FirebaseUtil.Instance().Auth(), newUser.email);
    } catch (e) {
      const err = e as FirebaseError;
      LogError(Module.FirebaseUtil, `Error resetting password for account ${newUser.email}`).then();
      result = {
        successful: false,
        errMessage: `Error resetting password for account ${newUser.email}: ${err.message}`,
        errCode: err.code
      };
    }
  }

  // Return errors to view
  return result;
}

function RandomPassword() {
  return Math.random().toString(36).substring(2, 12);
}

export async function GetUserList() {
  try {
    return GetInfoDB<UserInterface>(FirestoreGlobalLocation.User);
  } catch (e) {
    const err = e as FirebaseError;
    return LogError(Module.FirebaseUtil, `Error while retrieving UserList: ${err.message}`);
  }
}