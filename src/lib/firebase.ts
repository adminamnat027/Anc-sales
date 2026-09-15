import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  query,
  orderBy
} from 'firebase/firestore';
import { User, SalesRecord } from '../types';
import { INITIAL_USERS, INITIAL_SALES_RECORDS } from '../data/mockData';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId
export const db = getFirestore(
  app, 
  firebaseConfigJson.firestoreDatabaseId || '(default)'
);

// Connection test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: offline");
      return false;
    }
    // Any other response means server reached
    return true;
  }
}

// ------------------- Real-time Sync & CRUD Operations -------------------

// 1. Subscribe to Users
export function subscribeToUsers(
  onUpdate: (users: User[]) => void, 
  onError?: (err: Error) => void
) {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const usersList: User[] = [];
    snapshot.forEach(docSnap => {
      usersList.push(docSnap.data() as User);
    });
    onUpdate(usersList);
  }, (error) => {
    console.error("Firestore users subscription error:", error);
    if (onError) onError(error);
  });
}

// 2. Subscribe to Sales Records
export function subscribeToRecords(
  onUpdate: (records: SalesRecord[]) => void,
  onError?: (err: Error) => void
) {
  const recordsRef = collection(db, 'salesRecords');
  return onSnapshot(recordsRef, (snapshot) => {
    const recordsList: SalesRecord[] = [];
    snapshot.forEach(docSnap => {
      recordsList.push(docSnap.data() as SalesRecord);
    });
    // Sort newest first
    recordsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(recordsList);
  }, (error) => {
    console.error("Firestore records subscription error:", error);
    if (onError) onError(error);
  });
}

// Save or Update Record
export async function saveRecordToDb(record: SalesRecord): Promise<void> {
  const recordDoc = doc(db, 'salesRecords', record.id);
  await setDoc(recordDoc, record, { merge: true });
}

// Delete Record
export async function deleteRecordFromDb(recordId: string): Promise<void> {
  const recordDoc = doc(db, 'salesRecords', recordId);
  await deleteDoc(recordDoc);
}

// Save or Update User
export async function saveUserToDb(user: User): Promise<void> {
  const userDoc = doc(db, 'users', user.id);
  await setDoc(userDoc, user, { merge: true });
}

// Delete User
export async function deleteUserFromDb(userId: string): Promise<void> {
  const userDoc = doc(db, 'users', userId);
  await deleteDoc(userDoc);
}
