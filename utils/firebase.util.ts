import { FirebaseApp, FirebaseOptions } from "@firebase/app";
import { Firestore, QueryConstraint, setDoc, addDoc, query, where, limit, getDocs, collection } from "@firebase/firestore";
import { FirebaseStorage } from "@firebase/storage";
import { Auth, User, UserCredential } from "@firebase/auth";
import { FirebaseError } from "@firebase/util";
import { Notification } from "../types/firebase.type";
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
  AssetData,
  LogInInterface,
  UserInterface,
  UserWithPass
} from "../interfaces/firebase.interface";
import { CampaignParameterName, CommonErrorCode, Module, PageLocation } from "../enums/common.enum";
import { GoToPage } from "./router.util";
import { AddOrRemoveSlash, LogError, Raise, RandomPassword } from "./common.util";
import { Result } from "../types/common.type";
import { ConvertObject, ConvertType } from "./common/object-converter.util";
import { SessionUserInfo } from "./common/session.util";
import { CampaignParameters } from "../interfaces/common.interface";
import { ParameterNameType } from "../types/firebase.type";
import { Client } from '../enums/client.enum'
import { FeatureInterface, TierDistributionInterface } from "../interfaces/api.interface";
import { deleteDoc, doc, getDoc, increment, orderBy, Timestamp } from 'firebase/firestore';
import jwt from 'jsonwebtoken';
import { GetFollowerCounts } from "./web3/citizens.util";
import { XPReward } from "../constants/lukso/xp.constant";
import { ClaimableDrop } from "../interfaces/citizens.interface";
import { LeaderboardEntry } from "../types/leaderboard.type";
import { GetCitizensHoldings, GetWearablesHoldings } from "./web3/lukso/contract.util[deprecated]";
import { AVATAR_DOWNLOADED_STATUS, AVATAR_STATUS } from "../constants/firebase.constant";
import { Blockchain } from "../enums/blockchain/common.enum";
import { Campaign } from "../enums/citizens/common.enum";

export type LogInStructure = {
  user: string;
  pass: string;
};

export class FirebaseUtil {
  private static _instance: FirebaseUtil;
  private _app: FirebaseApp | null;
  private _db: Firestore | null;
  private _storage: FirebaseStorage | null;
  private _auth: Auth | null;
  private _luksoCampaign: string | undefined;

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

  public async Lukso() {
    if (this._luksoCampaign == undefined) {
      this._luksoCampaign = await GetLuksoCampaign();
    }

    return this._luksoCampaign;
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
    if (this._auth === null) {
      const { getAuth } = await import('@firebase/auth');
      this._auth = getAuth(await this.App());
    }

    return this._auth;
  }
}

async function CheckServerSide() {
  await FirebaseUtil.Instance().Auth();
  if (!(process.env.NEXT_PUBLIC_FB_USER && process.env.NEXT_PUBLIC_FB_PASS)) {
    console.error("Missing Firebase Server Account, please upload this params and redeploy the app.")
    return;
  }

  if (await IsNotLogIn()) {
    const logInfo: LogInInterface = {
      user: process.env.NEXT_PUBLIC_FB_USER,
      pass: process.env.NEXT_PUBLIC_FB_PASS,
    };
    await LogIn(logInfo);
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
    const { doc, getDoc } = await import('@firebase/firestore');
    const docRef = doc(await FirebaseUtil.Instance().DB(), dbLocation);
    const leDoc = await getDoc(docRef);

    const data = leDoc.data() as T;

    return { success: true, value: data ? [data] : [] };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

async function GetDocuments<T>(dbLocation: string, constraintsValues?: AGQueryConstraints): Promise<Result<(T & { id: string })[]>> {
  try {
    const constraints = await GetConstraints(dbLocation, constraintsValues);

    const { collection, getDocs, query } = await import('@firebase/firestore');

    const myQuery = query(collection(await FirebaseUtil.Instance().DB(), dbLocation), ...constraints);
    const querySnapshot = await getDocs(myQuery);

    const data = querySnapshot.docs.map(s => {
      return { ...s.data() as T, id: s.id };
    });

    return { success: true, value: data };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return { success: false, errMessage: err.message, errCode: err.code };
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
    default:
      return [];
  }
}

async function FeatureConstraints(constraintsValues: AGQueryConstraints) {
  const constraints: QueryConstraint[] = [];
  const { type, campaign } = constraintsValues;
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
  const { type, campaign } = constraintsValues;
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
  const { campaign, name } = constraintsValues;
  const { orderBy, where } = await import('@firebase/firestore');

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
    const { getBlob, ref } = await import('@firebase/storage');
    const campaignSection = campaign ? `${campaign.toLowerCase()}/` : '';
    const baseMeshRef = ref(await FirebaseUtil.Instance().Storage(), campaignSection + path);

    // // Server Side
    // const stream = await getStream(baseMeshRef);
    // return stream;

    const stream = await getBlob(baseMeshRef);
    return { success: true, value: await stream.arrayBuffer() };
  }
  catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, e);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function GetTierDistribution(campaign: string): Promise<(TierDistributionInterface & { id: string })[]> {
  const distributionPath = `${FirestoreGlobalLocation.Campaign}/${campaign}/tier_distribution`.toLowerCase()
  const db = await FirebaseUtil.Instance().DB()
  const ditributionQuery = query(collection(db, distributionPath));
  const distributionDocs = await getDocs(ditributionQuery);
  const distributionData = distributionDocs.docs.map(s => {
    return { ...(s.data() as TierDistributionInterface), id: s.id }
  });

  return distributionData
}

export async function SetTierDistribution(campaign: string): Promise<void> {
  //const distributionPath = `${FirestoreGlobalLocation.Campaign}/${campaign}`.toLowerCase()
  const distributionPath = `${FirestoreGlobalLocation.Campaign}/${campaign}/tier_distribution`.toLowerCase()
  const featuresPath = `${FirestoreGlobalLocation.Campaign}/${campaign}/features`.toLowerCase()

  // connect to the DB
  const db = await FirebaseUtil.Instance().DB()

  // get features subcollection, list all feature availables by campaign
  const featuresQuery = query(collection(db, featuresPath));
  const featuresDocs = await getDocs(featuresQuery);
  const featuresData = featuresDocs.docs.map((s): FeatureInterface & { id: string } => {
    return { ...(s.data() as FeatureInterface), id: s.id }
  });

  // get tier distribution subcollection 
  const distributionData = await GetTierDistribution(campaign)

  // get only missing features for tier distribution data
  const distributionFeaturesIds = distributionData.reduce((
    acc: Map<string, TierDistributionInterface>,
    obj: TierDistributionInterface) => {
    acc.set(obj.feature_id, obj)
    return acc
  }, new Map<string, TierDistributionInterface>())
  const missingFeatureDistributions = featuresData.filter((feat: FeatureInterface & { id: string }) => {
    return !distributionFeaturesIds.get(feat.id)
  })

  // Adding missing distribution data for feature
  missingFeatureDistributions.map(async (feature: FeatureInterface) => {
    const payload = {
      available: true,
      used: 0,
      feature_id: feature.id
    }

    // insert tier dist. document by feature
    await addDoc(
      collection(db, distributionPath),
      payload
    );

  })
}

export async function ResetTierDistribution(campaign: string, startValue = 0): Promise<void> {
  const distributionPath = `${FirestoreGlobalLocation.Campaign}/${campaign}/tier_distribution`.toLowerCase()

  const db = await FirebaseUtil.Instance().DB()
  const distributionQuery = query(collection(db, distributionPath))
  const distributionDocs = await getDocs(distributionQuery)
  distributionDocs.docs.map(async (dist) => {
    const payload = {
      used: startValue,
    }
    await setDoc(dist.ref, payload, { merge: true });
  });
}

export async function AddTierDistribution(campaign: string, feature: FeatureInterface): Promise<void> {
  const basedInventaryNumber = 1764
  const distributionPath = `${FirestoreGlobalLocation.Campaign}/${campaign}/tier_distribution`.toLowerCase()
  const db = await FirebaseUtil.Instance().DB()
  const distributionQuery = query(collection(db, distributionPath), where("feature_id", "==", feature.id))
  const distributionDocs = await getDocs(distributionQuery)
  const distDoc = distributionDocs.docs[0]
  const dist = distDoc.data()
  const tierResult = await GetParameter<{ [key: string]: number }>(
    campaign, CampaignParameterName.Random
  );
  if (!tierResult.success)
    return void LogError(Module.CollectionUtil, `Couldn't find featureList for campaign: ${campaign}`);
  const tierValues = tierResult.value

  const tierValue = tierValues[feature.tier]
  const limitAmount = Math.floor((basedInventaryNumber * tierValue) / 100)
  const newAmount = (dist as TierDistributionInterface).used + 1
  const isAvailable = limitAmount >= newAmount
  const payload = {
    used: newAmount,
    available: isAvailable,
  }

  return await setDoc(distDoc.ref, payload, { merge: true })
}

export async function GetAllCombinationsAvailable(
  campaign: string
): Promise<{ indexValues: string, status: string }[]> {
  const collectionPath = `collection/${campaign}/nft`
  const db = await FirebaseUtil.Instance().DB()
  const comboQuery = query(collection(db, collectionPath), where("status", "==", "n"))
  const comboDocs = await getDocs(comboQuery)
  const combinations = comboDocs.docs.map((comboDoc) =>
    ({ ...(comboDoc.data()), id: comboDoc.id }) as { indexValues: string, status: string, id: string }
  )

  return combinations
}

export async function GetParameter<T>(campaign: string | undefined, parameter: ParameterNameType): Promise<Result<T>> {
  try {
    if (parameter === CampaignParameterName.Missing) Raise("Non existent parameter wanted!");

    const { doc, getDoc } = await import('@firebase/firestore');

    const realLocation = campaign ? `${FirestoreGlobalLocation.Campaign}/${campaign}`.toLowerCase() : FirestoreGlobalLocation.ParametersV2;
    const docRef = doc(await FirebaseUtil.Instance().DB(), realLocation);
    const leDoc = await getDoc(docRef);

    const data = parameter === CampaignParameterName.All ?
      leDoc.data() as T :
      leDoc.get(parameter) as T;

    return data == undefined ?
      { success: false, errMessage: "Empty data on db!", errCode: CommonErrorCode.GetNoData } :
      { success: true, value: data };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, e);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function GetParameters<T>(campaign?: string, ...parameters: ParameterNameType[]): Promise<T[]> {
  const { doc, getDoc } = await import('@firebase/firestore');

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
  const { doc, setDoc } = await import('@firebase/firestore');

  try {
    const newLocation = campaign ?
      `${FirestoreGlobalLocation.Campaign}/${campaign.toLowerCase()}${AddOrRemoveSlash(location)}` :
      location !== FirestoreLocation.Parameters ?
        location :
        FirestoreGlobalLocation.Parameters;
    const newDocName = docName == undefined ? '' : `/${docName}`;

    // eslint-disable-next-line no-console
    const docRef = doc(await FirebaseUtil.Instance().DB(), `${newLocation}${newDocName}`);
    await setDoc(docRef, data, { merge: true });
    return { success: true, value: true };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error updating doc: ${docName ?? '--'}, errMessage: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function DeleteDoc(location: FirestoreLocation, docId: string, campaign?: string) {
  const { deleteDoc, doc } = await import('@firebase/firestore');

  await deleteDoc(doc(await FirebaseUtil.Instance().DB(), `${CampaignLocation(campaign)}${location}/${docId}`))
  return docId;
}

export async function ReplaceDoc(docLocation: string, jsonData?: string, campaign?: string) {
  if (jsonData) {
    const { doc, updateDoc } = await import('@firebase/firestore');
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
  const { addDoc, collection } = await import('@firebase/firestore');

  try {
    const newDoc = await addDoc(
      collection(await FirebaseUtil.Instance().DB(), CampaignLocation(campaign) + location),
      data);

    return { success: true, value: newDoc.id };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error creating doc, at ${location} with err message: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function InsertDocWithId(newDocId: string, data: object, location: FirestoreLocation | FirestoreGlobalLocation, campaign?: string, lowerCase = true): Promise<Result<string>> {
  const { setDoc, doc } = await import('@firebase/firestore');

  try {
    const docName = lowerCase ? newDocId.trim().toLowerCase() : newDocId.trim();
    const newDoc = doc(await FirebaseUtil.Instance().DB(), CampaignLocation(campaign) + location, docName);
    await setDoc(newDoc, data);
    return { success: true, value: newDocId };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error creating doc: ${newDocId}, at ${location} with message: ${err.message}`);
    return { success: false, errCode: err.code, errMessage: err.message };
  }
}

export async function UploadFile(file: File | null | undefined, fileType: StorageLocation, sectionType?: string, campaign?: string) {
  if (file == null) return void LogError(Module.FirebaseUtil, "Missing file to upload");

  const { ref, uploadBytes } = await import('@firebase/storage');
  const { v4: uuidv4 } = await import('uuid');

  const campaignSection = campaign ? `${campaign.toLowerCase()}/` : '';
  const realSection = sectionType ? '/' + sectionType.toLowerCase().replace('acc', '') : '';
  const newName = file.name ? file.name : uuidv4();

  const fileRef = ref(await FirebaseUtil.Instance().Storage(), `${campaignSection}${fileType}${realSection}/${newName}`);
  const log = await uploadBytes(fileRef, file);

  return log.metadata.fullPath;
}

export async function LogIn(credentials: LogInInterface) {
  if (!(credentials.pass && credentials.user))
    return;

  const { signInWithEmailAndPassword } = await import('@firebase/auth');

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

async function IsNotLogIn() {
  return !(await IsLogIn());
}

export async function LogOut() {
  const { signOut } = await import('@firebase/auth');

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
  if (filePath == undefined || filePath === '') {
    const msg = "Missing firebase path to get file URL!";
    void LogError(Module.FirebaseUtil, msg);
    return { success: false, errCode: CommonErrorCode.MissingInfo, errMessage: msg };
  }

  try {
    const { ref, getDownloadURL } = await import('@firebase/storage');

    const fileRef = ref(await FirebaseUtil.Instance().Storage(), filePath);
    const fileUrl = await getDownloadURL(fileRef);

    return { success: true, value: fileUrl };
  }
  catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message);
    return { success: false, errCode: err.code, errMessage: err.message };
  }
}

export async function HandleNotLoggedIn() {
  const isNotLogIn = await IsNotLogIn();

  if (isNotLogIn) {
    await GoToPage(PageLocation.Login);
  }

  return isNotLogIn;
}

export async function GetUserInfo(userUID: string): Promise<UserInterface | undefined> {
  const result = await GetInfoDB<UserInterface>(`${FirestoreGlobalLocation.User}/${userUID}`);
  if (result.success && result.value && result.value.length > 0) {
    const user = result.value[0];
    return {
      ...user,
      xp: user.xp ?? 0,
      level: user.level ?? 1
    };
  }
  return undefined;
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
    return { success: false, errMessage: 'Missing email on create user!', errCode: CommonErrorCode.MissingInfo };
  }

  const { createUserWithEmailAndPassword, updateCurrentUser } = await import('@firebase/auth');
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
    result = { success: true, value: true };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error on create User: ${err.message}`);
    result = { success: false, errMessage: `Error on create User: ${err.message}`, errCode: err.code };
    return result;
  }

  // Save user info on db
  if (leUser != undefined) {
    const baseUser = ConvertObject<UserInterface>(newUser, ConvertType.UserInterface);
    const userToInsert: UserInterface = {
      ...baseUser,
      xp: 0,
      level: 1
    };
    const insertedDoc = await InsertDocWithId(leUser.user.uid, userToInsert, FirestoreGlobalLocation.User, undefined, false);

    if (!insertedDoc.success) {
      const { deleteUser } = await import('@firebase/auth');

      try {
        await deleteUser(leUser.user);
      } catch (e) {
        const err = e as FirebaseError;
        const errMessage = `Error deleting wrongfully created auth account. Error: ${err.message}`;
        void LogError(Module.FirebaseUtil, errMessage);
        return { success: false, errMessage, errCode: err.code };
      }

      return { success: false, errMessage: insertedDoc.errMessage, errCode: insertedDoc.errCode };
    }
  }

  // Reset password
  if (result.success) {
    const { sendPasswordResetEmail } = await import('@firebase/auth');

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
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function GetCollectionList(dbLocation: string | FirestoreGlobalLocation) {
  const { collection, getDocs } = await import('@firebase/firestore');

  const querySnapshot = await getDocs(collection(await FirebaseUtil.Instance().DB(), dbLocation));
  return querySnapshot.docs.map(s => {
    return s.id
  });
}

export async function GetCollectionDocs(dbLocation: string | FirestoreGlobalLocation) {
  const { collection, getDocs } = await import('@firebase/firestore');

  const querySnapshot = await getDocs(collection(await FirebaseUtil.Instance().DB(), dbLocation));
  return querySnapshot.docs.map((doc) => doc.data())
}

export async function UpdateAdminCampaigns(): Promise<Result<boolean>> {
  try {
    const { doc, setDoc } = await import('@firebase/firestore');

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
    await setDoc(docRef, data, { merge: true });

    const newParams: AGParameters = {
      campaigns: campaignList,
    };
    await UpdateDocObject(FirestoreGlobalLocation.ParametersV2, newParams);

    return { success: true, value: true };
  }
  catch (e) {
    const msg = "Error updating admin campaigns!";
    void LogError(Module.FirebaseUtil, msg, e);
    return { success: false, errMessage: msg, errCode: CommonErrorCode.InternalError };
  }
}

export async function UpdateCampaignParameter(update: Partial<CampaignParameters>, campaign: string) {
  return await UpdateDocObject(FirestoreLocation.Parameters, update, campaign);
}

async function DeleteDocument(docLocation: string): Promise<Result<string>> {
  try {
    const { doc, deleteDoc } = await import('@firebase/firestore');
    const leDoc = doc(await FirebaseUtil.Instance().DB(), docLocation);

    await deleteDoc(leDoc);
    return { success: true, value: leDoc.id };
  } catch (err) {
    const error = err as FirebaseError;
    void LogError(Module.FirebaseUtil, error.message, error.code);
    return { success: false, errMessage: error.message, errCode: error.code };
  }
}

export async function DeleteCampaign(campaign: string): Promise<Result<string>> {
  try {
    // Remove campaign from user
    const currentUser = await GetCurrentUser();
    if (currentUser == null)
      return { success: false, errMessage: "No user authenticated right now!", errCode: CommonErrorCode.NoAuth };

    const userLocation = `${FirestoreGlobalLocation.User}/${currentUser.uid}`;
    const userDocRef = doc(await FirebaseUtil.Instance().DB(), userLocation);

    // Get user account base on role and last update
    const adminDoc = (await getDoc(userDocRef)).data() as UserInterface;
    const newData: Partial<UserInterface> = {
      campaign: adminDoc.campaign.filter(c => c.toLowerCase() !== campaign.toLowerCase())
    };

    await setDoc(userDocRef, newData, { merge: true });

    // Delete document (lowercase needed cuz reasons)
    const campaignLocation = `${FirestoreGlobalLocation.Campaign}/${campaign.toLowerCase()}`;
    return DeleteDocument(campaignLocation);
  }
  catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, err.message, err.code);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

async function GetLuksoCampaign() {
  const luksoCampaignLocation = "general/parametersV2";
  const docRef = doc(await FirebaseUtil.Instance().DB(), luksoCampaignLocation);
  const leDoc = await getDoc(docRef);

  const data = leDoc.get("client") as { lukso: string };

  if (data == undefined)
    Raise("No lukso campaign data to retrieve!");

  return data.lukso;
}

export async function UpdateAvatarStatus(combinationIndexes: string, status: keyof typeof AVATAR_STATUS) {
  if (combinationIndexes == undefined) Raise("Missing avatarId to update status!");

  const location = `collection/${Client.Lukso}/nft`;
  const combinationCollection = collection(await FirebaseUtil.Instance().DB(), location)
  const whereQuery = query(combinationCollection, where("indexValues", "==", combinationIndexes))
  const resultDoc = (await getDocs(whereQuery)).docs[0].ref

  await setDoc(resultDoc, { status: AVATAR_STATUS[status] }, { merge: true });
}

export async function GetAvatarStatus(combinationIndexes: string) {
  if (combinationIndexes == undefined)
    Raise("Missing avatarId to get status!");
  const location = `collection/${Client.Lukso}/nft`;
  const combinationCollection = collection(await FirebaseUtil.Instance().DB(), location)
  const whereQuery = query(combinationCollection, where("indexValues", "==", combinationIndexes))
  const resultDoc = (await getDocs(whereQuery)).docs[0].ref
  const status = await getDoc(resultDoc);

  return status.get('status') as string
}

export async function UpdateDownloadedAvatarStatus(combinationIndexes: string, downloadedStatus: keyof typeof AVATAR_DOWNLOADED_STATUS) {
  if (combinationIndexes == undefined) Raise("Missing avatarId to update status!");

  const location = `collection/${'lukso female b'}/nft`;
  const combinationCollection = collection(await FirebaseUtil.Instance().DB(), location)
  const whereQuery = query(combinationCollection, where("indexValues", "==", combinationIndexes))
  const resultDoc = (await getDocs(whereQuery)).docs[0].ref

  await setDoc(resultDoc, { downloadedStatus: AVATAR_DOWNLOADED_STATUS[downloadedStatus] }, { merge: true });
}

export async function GetAvatarDownloadedStatus(combinationIndexes: string) {
  if (combinationIndexes == undefined)
    Raise("Missing avatarId to get status!");
  const location = `collection/${'lukso female b'}/nft`;
  const combinationCollection = collection(await FirebaseUtil.Instance().DB(), location)
  const whereQuery = query(combinationCollection, where("indexValues", "==", combinationIndexes))
  const resultDoc = (await getDocs(whereQuery)).docs[0].ref
  const status = await getDoc(resultDoc);

  return status.get('downloadedStatus') as string
}

export async function GetAllCombinations(campaign: string, fromStatus: keyof typeof AVATAR_DOWNLOADED_STATUS) {
  const location = `collection/${campaign}/nft`;

  const combinationCollection1 = collection(await FirebaseUtil.Instance().DB(), location)
  const whereQuery = query(combinationCollection1, where("downloadedStatus", "==", AVATAR_DOWNLOADED_STATUS[fromStatus]))

  const resultDocs = (await getDocs(whereQuery)).docs

  return resultDocs
}

export async function GetRandomCombination() {
  const location = `collection/${await FirebaseUtil.Instance().Lukso()}/nft`;
  try {
    const combinationCollection = collection(await FirebaseUtil.Instance().DB(), location)
    const limitQuery = query(combinationCollection, limit(1765))
    const whereQuery = query(limitQuery, where("status", "==", "n"))

    const combinations = (await getDocs(whereQuery)).docs
    const randomIndex = Math.round(Math.random() * combinations.length)
    const combination = await getDoc(combinations[randomIndex].ref);
    return combination.get('indexValues') as string

  } catch (error) {
    return
  }
}

async function HandleFollowerChange(address: string, newCount: number, oldCount: number, blockchainType: Blockchain) {
  const newFollowers = newCount - oldCount;
  if (newFollowers <= 0) return;

  const xpGained = newFollowers * XPReward.NewFollower;
  const xpResult = await UpdateUserXP(address, xpGained);
  if (!xpResult.success) return;

  await CreateNotification(address, {
    title: 'New Followers',
    message: GenerateFollowerMessage(newFollowers, xpGained, xpResult.value),
    points: xpGained,
    time: new Date().toISOString(),
    id: '',
    blockchainType: blockchainType
  },
  );
}

async function HandleFollowingChange(address: string, newCount: number, oldCount: number, blockchainType: Blockchain) {
  const newFollowing = newCount - oldCount;
  if (newFollowing <= 0) return;

  const xpGained = newFollowing * XPReward.NewFollowing;
  const xpResult = await UpdateUserXP(address, xpGained);
  if (!xpResult.success) return;

  await CreateNotification(address, {
    title: 'New Following',
    message: GenerateFollowingMessage(newFollowing, xpGained, xpResult.value),
    points: xpGained,
    time: new Date().toISOString(),
    id: '',
    blockchainType: blockchainType
  }
  );
}

function GenerateFollowerMessage(count: number, xp: number, levelInfo: { leveledUp: boolean, newLevel: number }) {
  let message = `You've gained ${count} new follower${count > 1 ? 's' : ''}! You've earned ${xp} XP.`;
  if (levelInfo.leveledUp) {
    message += ` Congratulations! You've reached level ${levelInfo.newLevel}!`;
  }
  return message;
}

function GenerateFollowingMessage(count: number, xp: number, levelInfo: { leveledUp: boolean, newLevel: number }) {
  let message = `You're now following ${count} new account${count > 1 ? 's' : ''}! You've earned ${xp} XP.`;
  if (levelInfo.leveledUp) {
    message += ` Congratulations! You've reached level ${levelInfo.newLevel}!`;
  }
  return message;
}

export async function UpdateLastLoginDate(address: string, blockchainType: Blockchain): Promise<Result<boolean>> {
  if (address == undefined) Raise("Missing address to update last login date!");

  try {
    const location = `${FirestoreGlobalLocation.User}/${address.toLowerCase()}`;
    const userDocRef = doc(await FirebaseUtil.Instance().DB(), location);

    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserInterface;
      const lastLogin = userData.lastLogin?.toDate() || new Date(0);
      const now = new Date();
      const isFirstLoginOfDay = lastLogin.getDate() !== now.getDate() ||
        lastLogin.getMonth() !== now.getMonth() ||
        lastLogin.getFullYear() !== now.getFullYear();
      if (isFirstLoginOfDay) {
        let xpGained = XPReward.DailyLogin;

        // Increment login streak
        userData.loginStreak = (userData.loginStreak || 0) + 1;

        // Check if the streak is a multiple of 7 for the bonus
        if (userData.loginStreak % 7 === 0) {
          xpGained += XPReward.WeeklyLoginStreak;
        }
        const xpResult = await UpdateUserXP(address, xpGained);
        if (xpResult.success) {
          await CreateNotification(address, {
            title: 'Daily Login Reward',
            message: GenerateLoginMessage(xpGained, XPReward.WeeklyLoginStreak, xpResult.value),
            points: xpGained,
            time: new Date().toISOString(),
            id: '',
            blockchainType: blockchainType
          });
        }

      } else {
        // Reset streak if not consecutive
        userData.loginStreak = 1;
      }
      // Add holdings XP check after login rewards
      await HandleHoldingsXPReward(address, blockchainType);

      // Get current follower and following counts
      const followerCountsResult = await GetFollowerCounts(address);
      if (!followerCountsResult.success) return { success: false, errMessage: followerCountsResult.errMessage, errCode: followerCountsResult.errCode }
      const { followerCount, followingCount } = followerCountsResult.value

      // Check if follower/following counts have increased
      if (followerCount > (userData.followerCount || 0)) {
        await HandleFollowerChange(address, followerCount, userData.followerCount || 0, blockchainType);
      }

      if (followingCount > (userData.followingCount || 0)) {
        await HandleFollowingChange(address, followingCount, userData.followingCount || 0, blockchainType);
      }

      await setDoc(userDocRef, {
        lastLogin: Timestamp.now(),
        followerCount,
        followingCount,
        loginStreak: userData.loginStreak
      }, { merge: true });

    } else {
      // If the user doesn't exist, create a new document with all fields
      await setDoc(userDocRef, {
        account: '',
        campaign: [],
        email: '',
        name: '',
        role: 1,
        address: address.toLowerCase(),
        lastLogin: Timestamp.now(),
        xp: 50,
        level: 1,
        xpForNextLevel: 100,
        followerCount: 0,
        followingCount: 0,
        loginStreak: 1,
        blockchainType: blockchainType
      });
    }

    return { success: true, value: true };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error updating last login date for address ${address}: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

function CalculateLevel(xp: number): number {
  return Math.floor((-20 + Math.sqrt(400 + 40 * xp)) / 20) + 1;
}

function GetXpForNextLevel(currentLevel: number): number {
  return 10 * (Math.pow(currentLevel, 2) + 2 * currentLevel);
}

export async function UpdateUserXP(userId: string, xpToAdd: number): Promise<Result<{ newXP: number, newLevel: number, leveledUp: boolean }>> {
  try {
    const userDocRef = doc(await FirebaseUtil.Instance().DB(), `${FirestoreGlobalLocation.User}/${userId}`);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { success: false, errMessage: "User not found", errCode: CommonErrorCode.NotFound };
    }

    const userData = userDoc.data() as UserInterface;
    const oldLevel = userData.level || 1;
    const newXP = (userData.xp || 0) + xpToAdd;
    const newLevel = CalculateLevel(newXP);

    const xpForNextLevel = GetXpForNextLevel(newLevel);

    await setDoc(userDocRef, {
      xp: newXP,
      level: newLevel,
      xpForNextLevel: xpForNextLevel
    }, { merge: true });

    return { success: true, value: { newXP, newLevel, leveledUp: newLevel > oldLevel } };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error updating user XP: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function GenerateSessionToken(address: string, blockchainType: Blockchain): Promise<string> {
  try {
    await UpdateLastLoginDate(address, blockchainType);

    const token = jwt.sign(
      {
        address: address.toLowerCase(),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiration
      },
      process.env.JWT_SECRET as string
    );

    return token;
  } catch (error) {
    console.error('Error generating session token:', error);
    throw error;
  }
}

export async function CreateNotification(userAddress: string, notification: { title: string, message: string, points: number, time: string, id: string, blockchainType: Blockchain }): Promise<Result<boolean>> {
  try {
    const notificationRef = doc(collection(await FirebaseUtil.Instance().DB(), `${FirestoreGlobalLocation.User}/${userAddress}/notifications`));
    notification.id = notificationRef.id;
    await setDoc(notificationRef, notification);
    return { success: true, value: true };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error creating notification: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function GetUserNotifications(userAddress: string, limitCount: number = 8): Promise<Notification[]> {
  try {
    const notificationsRef = collection(await FirebaseUtil.Instance().DB(), `${FirestoreGlobalLocation.User}/${userAddress}/notifications`);
    const q = query(notificationsRef, orderBy("time", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Notification);
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error fetching user notifications: ${err.message}`);
    return [];
  }
}

export async function DeleteUserNotification(userAddress: string, notificationId: string): Promise<Result<boolean>> {
  try {
    const notificationRef = doc(
      collection(await FirebaseUtil.Instance().DB(), `${FirestoreGlobalLocation.User}/${userAddress}/notifications`),
      notificationId
    );
    await deleteDoc(notificationRef);
    return { success: true, value: true };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error deleting user notification: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function GetUserXPAndLevel(address: string) {
  if (!address) return { xp: 0, level: 0, nextLevelXP: 0 };

  try {
    const userRef = doc(await FirebaseUtil.Instance().DB(), FirestoreGlobalLocation.User, address.toLowerCase());
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        xp: userData.xp || 0,
        level: userData.level || 1,
        nextLevelXP: userData.xpForNextLevel || 0
      };
    } else {
      return { xp: 0, level: 1, nextLevelXP: 0 };
    }
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error fetching user XP and level: ${err.message}`);
    return { xp: 0, level: 1, nextLevelXP: 0 };
  }
}

function GenerateLoginMessage(xpGained: number, streakBonusXP: number, levelInfo: { leveledUp: boolean, newLevel: number }) {
  let message = `You've earned ${xpGained} XP for logging in today!`;
  if (streakBonusXP > 0) {
    message += ` This includes a ${streakBonusXP} XP bonus for your 7-day login streak!`;
  }
  if (levelInfo.leveledUp) {
    message += ` Congratulations! You've reached level ${levelInfo.newLevel}!`;
  }
  return message;
}

export async function GetClaimableDrops(campaign: Campaign): Promise<Result<ClaimableDrop[]>> {
  try {
    const db = await FirebaseUtil.Instance().DB();
    const dropsCollection = collection(db, `campaign/${campaign}/claimableDrops`);

    const querySnapshot = await getDocs(dropsCollection);
    return { success: true, value: querySnapshot.docs.map(doc => doc.data() as ClaimableDrop) };
  } catch (error) {
    void LogError(Module.FirebaseUtil, `Error fetching claimable drops: ${error}`);
    return { success: false, errMessage: "Error fetching claimable drops", errCode: CommonErrorCode.FetchError };
  }
}

export async function GetLeaderboardData(blockchainType: Blockchain = Blockchain.Lukso): Promise<LeaderboardEntry[]> {
  const db = await FirebaseUtil.Instance().DB();
  const usersRef = collection(db, 'user');
  const q = query(usersRef, orderBy('xp', 'desc'), limit(20), where('blockchainType', '==', blockchainType));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    address: doc.id,
    xp: doc.data().xp,
    level: doc.data().level,
    citizensHoldings: 0,
    wearablesHoldings: 0,
    name: '',
    profileImage: ''
  }));
}

export async function GetDropsContractAddresses(): Promise<string[]> {
  try {
    const vrmTypes = ['vrm_female', 'vrm_male'];

    const contractAddressesPromise = vrmTypes.map(async (vrmType) => {
      const dropsData = await GetCollectionDocs(`campaign/${vrmType}/drops`);
      const filteredAddresses = dropsData
        .filter(drop => drop.contract_address)
        .map(drop => drop.contract_address);
      return filteredAddresses;
    });

    const contractAddresses = await Promise.all(contractAddressesPromise);

    return contractAddresses.flat();
  } catch (error) {
    console.error('Error fetching drops contract addresses:', error);
    return [];
  }
}

function CalculateCitizensXP(citizensCount: number): number {
  let totalXP = 0;

  // Aplicar la fórmula para cada citizen
  for (let k = 1; k <= citizensCount; k++) {
    const xpForThisCitizen = 10 * (1 + 0.10 * (k - 1));
    totalXP += xpForThisCitizen;
  }

  return Math.floor(totalXP);
}

export async function HandleHoldingsXPReward(address: string, blockchainType: Blockchain): Promise<void> {
  try {
    const db = await FirebaseUtil.Instance().DB();
    const userRef = doc(db, `${FirestoreGlobalLocation.User}/${address.toLowerCase()}`);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserInterface;
    // Get current holdings

    const contractAddresses = await GetDropsContractAddresses();
    const currentCitizensHoldingsPromise = GetCitizensHoldings(address);
    const currentWearablesHoldingsPromise = GetWearablesHoldings(address, contractAddresses);
    const [currentCitizensHoldings, currentWearablesHoldings] = await Promise.all([currentCitizensHoldingsPromise, currentWearablesHoldingsPromise]);

    // Get previous holdings from DB
    const previousCitizensHoldings = userData.citizensHoldings || 0;
    const previousWearablesHoldings = userData.wearablesHoldings || 0;
    // Only calculate XP if holdings have increased
    const newCitizens = currentCitizensHoldings - previousCitizensHoldings;
    const newWearables = currentWearablesHoldings - previousWearablesHoldings;
    if (newCitizens > 0 || newWearables > 0) {
      // Calculate XP only for new holdings
      const citizensXP = CalculateCitizensXP(newCitizens);
      const wearablesXP = newWearables * XPReward.WearableHolding;
      const totalXP = citizensXP + wearablesXP;
      if (totalXP > 0) {
        // Update user XP
        const updateXpPromise = UpdateUserXP(address, totalXP);
        // Update holdings record in DB
        const setDocPromise = setDoc(userRef, {
          citizensHoldings: currentCitizensHoldings,
          wearablesHoldings: currentWearablesHoldings,
          lastHoldingsUpdate: Timestamp.now()
        }, { merge: true });
        // Create notification
        const createNotificationPromise = CreateNotification(address, {
          title: 'New Holdings Reward',
          message: GenerateHoldingsMessage(citizensXP, wearablesXP, totalXP),
          points: totalXP,
          time: new Date().toISOString(),
          id: '',
          blockchainType: blockchainType
        });
        await Promise.all([updateXpPromise, setDocPromise, createNotificationPromise]);
      }
    }
  } catch (error) {
    console.error('Error processing holdings XP:', error);
  }
}

function GenerateHoldingsMessage(
  citizensXP: number,
  wearablesXP: number,
  totalXP: number,
): string {
  let message = `You've earned ${totalXP} XP for your holdings! `;

  if (citizensXP > 0) {
    message += `(Citizens: ${citizensXP} XP) `;
  }

  if (wearablesXP > 0) {
    message += `(Wearables: ${wearablesXP} XP)`;
  }


  return message;
}

export async function TrackUserLogin(address: string): Promise<Result<boolean>> {
  try {
    const db = await FirebaseUtil.Instance().DB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];

    // Registro único diario por usuario (para usuarios activos)
    const userLoginRef = doc(db, 'statistics', 'dailyLogins', 'users', address, 'dates', dateString);
    const userLoginDoc = await getDoc(userLoginRef);

    if (!userLoginDoc.exists()) {
      // Primera vez en el día - crear registro
      await setDoc(userLoginRef, {
        date: dateString,
        firstLogin: Timestamp.now(),
        loginCount: 1,
        lastLogin: Timestamp.now()
      });

      // Actualizar contador global de usuarios únicos diarios
      const globalLoginRef = doc(db, 'statistics', 'dailyLogins', 'dates', dateString);
      await setDoc(globalLoginRef, {
        uniqueUsers: increment(1),
        totalLogins: increment(1),
        date: dateString,
        lastUpdated: Timestamp.now()
      }, { merge: true });
    } else {
      // Usuario ya registrado hoy - actualizar contador de logins
      await setDoc(userLoginRef, {
        loginCount: increment(1),
        lastLogin: Timestamp.now()
      }, { merge: true });

      // Actualizar solo el contador total de logins global
      const globalLoginRef = doc(db, 'statistics', 'dailyLogins', 'dates', dateString);
      await setDoc(globalLoginRef, {
        totalLogins: increment(1),
        lastUpdated: Timestamp.now()
      }, { merge: true });
    }

    return { success: true, value: true };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error tracking user login: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function StoreAssetData(assetData: AssetData): Promise<Result<boolean>> {
  try {
    const { tokenId, campaign, collectionId } = assetData;
    const db = await FirebaseUtil.Instance().DB();
    const assetDataCollection = collection(db, `${FirestoreGlobalLocation.Campaign}/${campaign}/${FirestoreLocation.AssetData}`);
    const assetRef = doc(assetDataCollection, `${collectionId}:${tokenId}`);
    await setDoc(assetRef, assetData, { merge: true });
    return { success: true, value: true };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error storing asset data: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}

export async function GetAssetData(campaign: string, collectionId: string, tokenId: string): Promise<Result<AssetData>> {
  try {
    const db = await FirebaseUtil.Instance().DB();
    const assetDataCollection = collection(db, `${FirestoreGlobalLocation.Campaign}/${campaign}/${FirestoreLocation.AssetData}`);
    const assetRef = doc(assetDataCollection, `${collectionId}:${tokenId}`);
    const assetDoc = await getDoc(assetRef);
    return { success: true, value: assetDoc.data() as AssetData };
  } catch (e) {
    const err = e as FirebaseError;
    void LogError(Module.FirebaseUtil, `Error getting asset data: ${err.message}`);
    return { success: false, errMessage: err.message, errCode: err.code };
  }
}
