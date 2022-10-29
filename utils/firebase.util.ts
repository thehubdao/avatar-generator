import {FirebaseApp, FirebaseOptions} from "@firebase/app";
import {Firestore, QueryConstraint} from "@firebase/firestore";
import {FirebaseStorage} from "@firebase/storage";
import {Auth, User} from "@firebase/auth";

import {FirestoreFilterValues, FirestoreParameters, FirestoreValues, StorageValues} from "../enums/firebase.enum";
import {AGQueryConstraints, LogInInterface} from "../interfaces/firebase.interface";
import Router from "next/router";
import {PageLocation} from "../enums/common.enum";

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
      const { initializeApp } = await import('@firebase/app');
      this._app = initializeApp(config);
    }

    return this._app;
  }

  public async DB() {
    const checked = CheckServerSide();
    // console.log('DB: ', !!this._db);
    if (this._db === null) {
      const { getFirestore } = await import('@firebase/firestore');
      this._db = getFirestore(await this.App());
    }

    await checked;
    return this._db;
  }

  public async Storage() {
    const checked = CheckServerSide();
    // console.log('Storage: ', !!this._storage);
    if (this._storage === null) {
      const { getStorage } = await import('@firebase/storage');
      this._storage = getStorage(await this.App());
    }

    await checked;
    return this._storage;
  }
  
  public async Auth() {
    // console.log('Auth: ', !!this._auth);
    if(this._auth === null) {
      const { getAuth } = await import('@firebase/auth');
      this._auth = getAuth(await this.App());
    }
    
    return this._auth;
  }
}

async function CheckServerSide() {
  // server side
  if(typeof window === 'undefined') {
    await FirebaseUtil.Instance().Auth();

    if (await IsNotLogIn()) {
      const logInfo: LogInInterface = {
        user: process.env.AG_FB_USER!,
        pass: process.env.AG_FB_PASS!,
      };
      await LogIn(logInfo);
    }
  }
}

export async function GetInfoDB<T>(dbLocation: FirestoreValues | string, constraintsValues?: AGQueryConstraints, doConstraints: boolean = true) {
  let constraints: QueryConstraint[] = [];
  const result: T[] = [];

  if (dbLocation.split('/').length % 2 === 0) {
    const { doc, getDoc } = await import('@firebase/firestore');
    const docRef = doc(await FirebaseUtil.Instance().DB(), dbLocation);
    const leDoc = await getDoc(docRef);

    result.push(leDoc.data() as T);
  } else {
    if (doConstraints && constraintsValues)
      constraints = await GetConstraints(dbLocation, constraintsValues);

    const { collection, getDocs, query } = await import('@firebase/firestore');
    
    const myQuery = query(collection(await FirebaseUtil.Instance().DB(), dbLocation), ...constraints);
    const querySnapshot = await getDocs(myQuery);

    querySnapshot.forEach(snap => {
      result.push({...snap.data() as T, id: snap.id});
    })
  }

  return result;
}

function GetConstraints(dbLocation: FirestoreValues | string, constraintsValues: AGQueryConstraints) {
  switch (dbLocation) {
    case FirestoreValues.Parts:
      return PartConstraints(constraintsValues);
    case FirestoreValues.Accessories:
      return AccessoryConstraints(constraintsValues);
    case FirestoreValues.Animations:
      return AnimationConstraints(constraintsValues);
    default:
      return [];
  }
}

async function PartConstraints(constraintsValues: AGQueryConstraints) {
  const constraints: QueryConstraint[] = [];
  const {type, campaign} = constraintsValues;
  const { orderBy, where } = await import('@firebase/firestore');

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
  const { orderBy, where } = await import('@firebase/firestore');

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
  const { orderBy, where } = await import('@firebase/firestore');

  if (campaign)
    constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

  constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

  return constraints;
}

export async function GetFile(path: string) {
  const { getBlob, ref } = await import('@firebase/storage');
  const baseMeshRef = ref(await FirebaseUtil.Instance().Storage(), path);

  // Server Side
  // const stream = await getStream(baseMeshRef);
  // return stream;

  const stream = await getBlob(baseMeshRef);
  return stream.arrayBuffer();
}

export async function GetParameters<T>(...parameters: string[]): Promise<T[]> {
  const { doc, getDoc } = await import('@firebase/firestore');
  const docRef = doc(await FirebaseUtil.Instance().DB(), FirestoreParameters.BasePath);
  const leDoc = await getDoc(docRef);

  const result: T[] = [];
  for (const parameter of parameters) {
    result.push(leDoc.get(parameter));
  }
  
  return result;
}

export async function UpdateDB(location: FirestoreValues, jsonData: string) {
  const { doc, setDoc } = await import('@firebase/firestore');
  const docRef = doc(await FirebaseUtil.Instance().DB(), location);
  return await setDoc(docRef, JSON.parse(jsonData), {merge: true});
}

export async function DeleteDoc(dbLocation: FirestoreValues, docId: string) {
  const { deleteDoc, doc } = await import('@firebase/firestore');
  await deleteDoc(doc(await FirebaseUtil.Instance().DB(), `${dbLocation}/${docId}`))
  return docId;
}

export async function UpdateDoc(docLocation?: string, jsonData?: string) {
  if (docLocation && jsonData) {
    const { doc, updateDoc } = await import('@firebase/firestore');
    const docRef = doc(await FirebaseUtil.Instance().DB(), docLocation);
    await updateDoc(docRef, JSON.parse(jsonData));
  }
}

export async function InsertDB(jsonData: string, location: string = FirestoreValues.Parts) {
  console.log(jsonData);
  const { addDoc, collection } = await import('@firebase/firestore');
  const newDoc = await addDoc(collection(await FirebaseUtil.Instance().DB(), location), JSON.parse(jsonData));
  console.log('New Doc: ', newDoc.id);
}

export async function UploadFile(file: File, fileType: StorageValues, sectionType?: string) {
  const { ref, uploadBytes } = await import('@firebase/storage');
  const realSection = sectionType ? '/' + sectionType.toLowerCase().replace('acc', '') : '';
  const fileRef = ref(await FirebaseUtil.Instance().Storage(), `${fileType}${realSection}/${file.name}`);
  const log = await uploadBytes(fileRef, file);

  return log.metadata.fullPath;
}

export async function LogIn(credentials: LogInInterface) {
  if(!(credentials.pass && credentials.user))
    return;

  const { signInWithEmailAndPassword } = await import('@firebase/auth');
  
  let actualUser = credentials.user;
  if(!credentials.user.includes('@')) {
    actualUser = `${credentials.user}@freak.com`;
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
  const { signOut } = await import('@firebase/auth');
  signOut(await FirebaseUtil.Instance().Auth())
    .then(async () => {
      await Router.push(PageLocation.Admin);
    });
}

export async function GetCurrentUser() {
  return new Promise<User | null>(async (resolve) => {
    (await FirebaseUtil.Instance().Auth()).onAuthStateChanged((user) => {
      resolve(user);
    })
  });
}