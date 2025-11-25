import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDsTXq7-6mX6gD-z-c-e_Z_q_Z_q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dhtbaru-fef85.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://dhtbaru-fef85-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dhtbaru-fef85",
};

let app: any;
let database: any;

export const initFirebase = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
    }
    return { app, database };
  } catch (error) {
    console.error('[v0] Firebase init error:', error);
    return { app: null, database: null };
  }
};

export const getDb = () => {
  if (!database) initFirebase();
  return database;
};

export const subscribeToReadings = (callback: (data: any) => void) => {
  try {
    const db = getDb();
    if (!db) {
      console.error('[v0] Firebase not initialized');
      return null;
    }
    const ref_obj = ref(db, 'readings');
    return onValue(ref_obj, (snapshot) => {
      callback(snapshot.val() || {});
    }, (error) => {
      console.error('[v0] Firebase readings error:', error);
      callback({});
    });
  } catch (error) {
    console.error('[v0] Subscribe error:', error);
    return null;
  }
};

export const subscribeToHistory = (callback: (data: any) => void, limit: number = 60) => {
  try {
    const db = getDb();
    if (!db) return null;
    
    const historyRef = ref(db, 'history');
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data).slice(-limit);
        callback(Object.fromEntries(entries));
      } else {
        callback({});
      }
    }, (error) => {
      console.error('[v0] Error reading history:', error);
      callback({});
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('[v0] Subscribe to history error:', error);
    return null;
  }
};

export const subscribeToMytime = (callback: (data: any) => void) => {
  try {
    const db = getDb();
    if (!db) return null;
    
    const mytimeRef = ref(db, 'Mytime');
    const unsubscribe = onValue(mytimeRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    }, (error) => {
      console.error('[v0] Error reading Mytime:', error);
      callback(null);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('[v0] Subscribe to Mytime error:', error);
    return null;
  }
};
