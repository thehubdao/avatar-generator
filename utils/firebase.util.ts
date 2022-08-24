import {FirebaseApp, FirebaseOptions, initializeApp} from "@firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  QueryConstraint,
  setDoc,
  updateDoc,
  where
} from "@firebase/firestore";
import {FirestoreFilterValues, FirestoreParameters, FirestoreValues, StorageValues} from "../enums/firebase.enum";
import {FirebaseStorage, getBlob, getStorage, ref, uploadBytes} from "@firebase/storage";
import {AGQueryConstraints} from "../interfaces/firebase.interface";

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
    if (FirebaseUtil._instance === undefined)
      FirebaseUtil._instance = new FirebaseUtil();

    return FirebaseUtil._instance;
  }

  private App() {
    if (this._app === null) {
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
    if (this._db === null)
      this._db = getFirestore(this.App());

    return this._db;
  }

  private Storage() {
    if (this._storage === null)
      this._storage = getStorage(this.App());

    return this._storage;
  }

  public async GetInfoDB<T>(dbLocation: FirestoreValues | string, constraintsValues?: AGQueryConstraints, doConstraints: boolean = true) {
    let constraints: QueryConstraint[] = [];
    const result: T[] = [];

    if (dbLocation.split('/').length % 2 === 0) {
      const docRef = doc(this.DB(), dbLocation);
      const leDoc = await getDoc(docRef);

      result.push(leDoc.data() as T);
    } else {
      if (doConstraints && constraintsValues)
        constraints = this.getConstraints(dbLocation, constraintsValues);

      const myQuery = query(collection(this.DB(), dbLocation), ...constraints);
      const querySnapshot = await getDocs(myQuery);

      querySnapshot.forEach(snap => {
        result.push({...snap.data() as T, id: snap.id});
      })
    }

    return result;
  }

  private getConstraints(dbLocation: FirestoreValues | string, constraintsValues: AGQueryConstraints) {
    switch (dbLocation) {
      case FirestoreValues.Parts:
        return this.PartConstraints(constraintsValues);
      case FirestoreValues.Accessories:
        return this.AccessoryConstraints(constraintsValues);
      case FirestoreValues.Animations:
        return this.AnimationConstraints(constraintsValues);
      default:
        return [];
    }
  }

  private PartConstraints(constraintsValues: AGQueryConstraints) {
    const constraints: QueryConstraint[] = [];
    const {type, campaign} = constraintsValues;

    if (campaign)
      constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

    if (type)
      constraints.push(where(FirestoreFilterValues.Type, "==", type));

    constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

    return constraints;
  }

  private AccessoryConstraints(constraintsValues: AGQueryConstraints) {
    const constraints: QueryConstraint[] = [];
    const {type, campaign} = constraintsValues;

    if (campaign)
      constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

    if (type)
      constraints.push(where(FirestoreFilterValues.Type, "==", type));

    constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

    return constraints;
  }

  private AnimationConstraints(constraintsValues: AGQueryConstraints) {
    const constraints: QueryConstraint[] = [];
    const {campaign} = constraintsValues;

    if (campaign)
      constraints.push(where(FirestoreFilterValues.Campaign, "array-contains", campaign));

    constraints.push(orderBy(FirestoreFilterValues.Name, "asc"));

    return constraints;
  }

  async InsertDB(jsonData: string, location: string = FirestoreValues.Parts) {
    console.log(jsonData);
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

  // TODO: remove
  async DoSomeStorage() {
    const baseMeshRef = ref(this.Storage(), 'base_mesh/base.glb');
    const stream = await getBlob(baseMeshRef);
    console.log(stream);
  }

  async GetParameters<T>(...parameters: string[]): Promise<T[]> {
    const docRef = doc(this.DB(), FirestoreParameters.BasePath);
    const leDoc = await getDoc(docRef);

    const result: T[] = [];
    for (const parameter of parameters) {
      result.push(leDoc.get(parameter));
    }

    return result;
  }

  async UploadFile(file: File, fileType: StorageValues, sectionType?: string) {
    const realSection = sectionType ? '/' + sectionType.toLowerCase().replace('acc', '') : '';
    const fileRef = ref(this.Storage(), `${fileType}${realSection}/${file.name}`);
    const log = await uploadBytes(fileRef, file);

    return log.metadata.fullPath;
  }

  async UpdateDB(location: FirestoreValues, jsonData: string) {
    const docRef = doc(this.DB(), location);
    return await setDoc(docRef, JSON.parse(jsonData), {merge: true});
  }

  async DeleteDoc(dbLocation: FirestoreValues, docId: string) {
    await deleteDoc(doc(this.DB(), `${dbLocation}/${docId}`))
    return docId;
  }

  async UpdateDoc(docLocation?: string, jsonData?: string) {
    if (docLocation && jsonData) {
      const docRef = doc(this.DB(), docLocation);
      await updateDoc(docRef, JSON.parse(jsonData));
    }
  }
}