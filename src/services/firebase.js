import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';

const STORAGE_KEY = 'sarapan_ceria_firebase_config';

/**
 * Mendapatkan konfigurasi Firebase aktif.
 * Prioritas: 
 * 1. Disimpan di localStorage (dari menu Pengaturan)
 * 2. Dari file environment (.env)
 */
export const getActiveFirebaseConfig = () => {
  // Cek localStorage dulu
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.projectId && parsed.apiKey) {
        return { ...parsed, source: 'settings' };
      }
    }
  } catch (e) {
    console.warn("Gagal membaca konfigurasi Firebase dari localStorage:", e);
  }

  // Fallback ke .env
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    source: 'env'
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
};

export const saveFirebaseConfigToStorage = (config) => {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
};

let appInstance = null;
let dbInstance = null;
let activeUnsubscribers = [];

/**
 * Inisialisasi Firebase App & Firestore
 */
export const initFirebase = (customConfig = null) => {
  const config = customConfig || getActiveFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId) {
    return { success: false, reason: 'unconfigured' };
  }

  try {
    // Unsubscribe listeners sebelumnya jika ada
    stopFirebaseSync();

    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(config);
    }

    dbInstance = getFirestore(appInstance);
    return { success: true, db: dbInstance, config };
  } catch (error) {
    console.error("Firebase init error:", error);
    return { success: false, error };
  }
};

export const getDb = () => {
  if (!dbInstance) {
    const res = initFirebase();
    if (res.success) return res.db;
  }
  return dbInstance;
};

/**
 * Menghentikan semua listener Firestore aktif
 */
export const stopFirebaseSync = () => {
  activeUnsubscribers.forEach(unsub => {
    try {
      if (typeof unsub === 'function') unsub();
    } catch {
      // ignore
    }
  });
  activeUnsubscribers = [];
};

/**
 * Langganan (realtime subscription) data Vendors
 */
export const subscribeToVendors = (onData, onError) => {
  const db = getDb();
  if (!db) return () => {};

  try {
    const q = collection(db, 'vendors');
    const unsub = onSnapshot(q, (snapshot) => {
      const vendors = [];
      snapshot.forEach((docSnap) => {
        vendors.push({ id: docSnap.id, ...docSnap.data() });
      });
      onData(vendors);
    }, (error) => {
      console.error("Firestore vendors sync error:", error);
      if (onError) onError(error);
    });

    activeUnsubscribers.push(unsub);
    return unsub;
  } catch (err) {
    console.error("Failed to setup vendor subscription:", err);
    return () => {};
  }
};

/**
 * Langganan (realtime subscription) data Products
 */
export const subscribeToProducts = (onData, onError) => {
  const db = getDb();
  if (!db) return () => {};

  try {
    const q = collection(db, 'products');
    const unsub = onSnapshot(q, (snapshot) => {
      const products = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() });
      });
      onData(products);
    }, (error) => {
      console.error("Firestore products sync error:", error);
      if (onError) onError(error);
    });

    activeUnsubscribers.push(unsub);
    return unsub;
  } catch (err) {
    console.error("Failed to setup product subscription:", err);
    return () => {};
  }
};

/**
 * Langganan (realtime subscription) data Daily Records
 */
export const subscribeToDailyRecords = (onData, onError) => {
  const db = getDb();
  if (!db) return () => {};

  try {
    const q = collection(db, 'dailyRecords');
    const unsub = onSnapshot(q, (snapshot) => {
      const dailyRecords = {};
      snapshot.forEach((docSnap) => {
        dailyRecords[docSnap.id] = docSnap.data();
      });
      onData(dailyRecords);
    }, (error) => {
      console.error("Firestore dailyRecords sync error:", error);
      if (onError) onError(error);
    });

    activeUnsubscribers.push(unsub);
    return unsub;
  } catch (err) {
    console.error("Failed to setup dailyRecords subscription:", err);
    return () => {};
  }
};

// --- Operasi CRUD ke Firebase ---

export const syncVendorToCloud = async (vendor) => {
  const db = getDb();
  if (!db || !vendor?.id) return;
  await setDoc(doc(db, 'vendors', vendor.id), vendor, { merge: true });
};

export const deleteVendorFromCloud = async (vendorId) => {
  const db = getDb();
  if (!db || !vendorId) return;
  await deleteDoc(doc(db, 'vendors', vendorId));
};

export const syncProductToCloud = async (product) => {
  const db = getDb();
  if (!db || !product?.id) return;
  await setDoc(doc(db, 'products', product.id), product, { merge: true });
};

export const deleteProductFromCloud = async (productId) => {
  const db = getDb();
  if (!db || !productId) return;
  await deleteDoc(doc(db, 'products', productId));
};

export const syncDailyRecordToCloud = async (date, dayRecord) => {
  const db = getDb();
  if (!db || !date) return;
  await setDoc(doc(db, 'dailyRecords', date), dayRecord, { merge: true });
};

export const deleteDailyRecordFromCloud = async (date) => {
  const db = getDb();
  if (!db || !date) return;
  await deleteDoc(doc(db, 'dailyRecords', date));
};

/**
 * Mengunggah seluruh data lokal saat ini ke Firestore
 */
export const uploadAllLocalDataToCloud = async ({ vendors = [], products = [], dailyRecords = {} }) => {
  const db = getDb();
  if (!db) throw new Error("Firebase belum terkonfigurasi");

  const batch = writeBatch(db);

  // Upload vendors
  vendors.forEach(v => {
    if (v.id) {
      batch.set(doc(db, 'vendors', v.id), v, { merge: true });
    }
  });

  // Upload products
  products.forEach(p => {
    if (p.id) {
      batch.set(doc(db, 'products', p.id), p, { merge: true });
    }
  });

  // Upload daily records
  Object.keys(dailyRecords).forEach(date => {
    batch.set(doc(db, 'dailyRecords', date), dailyRecords[date], { merge: true });
  });

  await batch.commit();
};
