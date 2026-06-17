import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let firebaseAdminApp: admin.app.App | null = null;
const globalAny = global as any;

export function getFirebaseAdmin() {
  if (globalAny.firebaseAdminApp) {
    return globalAny.firebaseAdminApp;
  }
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  const appName = "my-unique-admin-app-2";
  
  if (admin.apps.length > 0) {
    const existing = admin.apps.find(a => a?.name === appName);
    if (existing) {
      firebaseAdminApp = existing;
      return firebaseAdminApp;
    }
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountEnv) {
    console.warn("FIREBASE_SERVICE_ACCOUNT is not set. Throwing error to avoid ADC metadata server hang.");
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set. Cannot initialize Firebase Admin.");
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'cjp-media'
      }, appName);
      globalAny.firebaseAdminApp = firebaseAdminApp;
    } catch (e: any) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Throwing error:", e);
      throw new Error(`FIREBASE_SERVICE_ACCOUNT is not a valid JSON. Ensure you copy the entire service account JSON file contents. Error: ${e.message}`);
    }
  }

  return firebaseAdminApp;
}

export function getAdminDb() {
  if (globalAny.firebaseAdminDb) {
    return globalAny.firebaseAdminDb;
  }
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  const app = getFirebaseAdmin();
  let db;
  if (dbId) {
    db = getFirestore(app, dbId);
  } else {
    db = getFirestore(app);
  }
  globalAny.firebaseAdminDb = db;
  return db;
}
