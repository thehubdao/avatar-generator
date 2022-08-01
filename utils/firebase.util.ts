import {FirebaseApp, FirebaseOptions, initializeApp} from "@firebase/app";
import {
  addDoc,
  collection,
  Firestore,
  getDocs,
  getFirestore,
  query,
  QueryConstraint,
  where,
  orderBy,
  getDoc, doc, setDoc
} from "@firebase/firestore";
import {FirestoreFilterValues, FirestoreParameters, FirestoreValues, StorageValues} from "../enums/common.enum";
import {AccLocationApi, BodyPartLocationApi} from "../interfaces/api.interface";
import {FirebaseStorage, getBlob, getStorage, getStream, ref, uploadBytes} from "@firebase/storage";

export class FirebaseUtil {
  private static _instance: FirebaseUtil;
  private _app: FirebaseApp | null;
  private _db: Firestore | null;
  private _storage: FirebaseStorage | null;
  
  constructor() {
    this._app = null;
    this._db = null;
    this._storage = null;
  }
  
  public static Instance() {
    if(FirebaseUtil._instance === undefined)
      FirebaseUtil._instance = new FirebaseUtil();
    
    return FirebaseUtil._instance;
  }
  
  private App() {
    if(this._app === null) {
      const config: FirebaseOptions = {
        appId: process.env.NEXT_PUBLIC_FB_APP_ID,
        apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
        messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
        storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
      }

      this._app = initializeApp(config);
    }
    
    return this._app;
  }
  private DB() {
    if(this._db === null)
      this._db = getFirestore(this.App());
    
    return this._db;
  }
  private Storage() {
    if(this._storage === null)
      this._storage = getStorage(this.App());
    
    return this._storage;
  }
  
  public async GetParts(campaign?: string, type?: number) {
    const constraints: QueryConstraint[] = [];
    const result: BodyPartLocationApi[] = [];
    
    if(campaign)
      constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));
    
    if(type)
      constraints.push(where(FirestoreFilterValues.Type, "==", type));
    
    constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));
    
    const myQuery = query(collection(this.DB(), FirestoreValues.Parts), ...constraints);
    const querySnapshot = await getDocs(myQuery);
    
    querySnapshot.forEach(snap => {
      result.push({ ...snap.data() as BodyPartLocationApi, id: snap.id });
    })
    
    return result;
  }

  public async GetAccessories(campaign?: string, type?: string) {
    const constraints: QueryConstraint[] = [];
    const result: AccLocationApi[] = [];

    if(campaign)
      constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

    if(type)
      constraints.push(where(FirestoreFilterValues.Type, "==", type));

    constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

    const myQuery = query(collection(this.DB(), FirestoreValues.Accessories), ...constraints);
    const querySnapshot = await getDocs(myQuery);

    querySnapshot.forEach(snap => {
      result.push({ ...snap.data() as AccLocationApi, id: snap.id });
    })

    return result;
  }

  async InsertDB(location: string = FirestoreValues.Parts, jsonData: string) {
    const newDoc = await addDoc(collection(this.DB(), location), JSON.parse(jsonData));
    console.log('New Doc: ', newDoc.id);
  }
  
  async GetFile(path: string) {
    const baseMeshRef = ref(this.Storage(), path);
    
    // Server Side
    // const stream = await getStream(baseMeshRef);
    // return stream;
    
    const stream = await getBlob(baseMeshRef);
    return stream.arrayBuffer();
  }

  async DoSomeStorage() {
    const baseMeshRef = ref(this.Storage(), 'base_mesh/base.glb');
    const stream = await getBlob(baseMeshRef);
    console.log(stream);
  }

  async GetParameters<T>(...parameters: string[]): Promise<T[]> {
    const docRef = doc(this.DB(), FirestoreParameters.BasePath);
    const leDoc = await getDoc(docRef);

    const result = [];
    for (const parameter of parameters) {
      result.push(leDoc.get(parameter));
    }
    
    return result;
  }

  async UploadFile(file: File, fileType: StorageValues) {
    const fileRef = ref(this.Storage(), `${fileType}/${file.name}`);
    const log = await uploadBytes(fileRef, file);

    return log.metadata.fullPath;
  }

  async UpdateDB(location: FirestoreValues, jsonData: string) {
    const docRef = doc(this.DB(), location);
    return await setDoc(docRef, JSON.parse(jsonData), { merge: true });
  }
}