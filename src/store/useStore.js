import { create } from 'zustand';
import localforage from 'localforage';
import {
  initFirebase,
  getActiveFirebaseConfig,
  saveFirebaseConfigToStorage,
  stopFirebaseSync,
  subscribeToVendors,
  subscribeToProducts,
  subscribeToDailyRecords,
  syncVendorToCloud,
  deleteVendorFromCloud,
  syncProductToCloud,
  deleteProductFromCloud,
  syncDailyRecordToCloud,
  uploadAllLocalDataToCloud
} from '../services/firebase';

// Configure localforage
localforage.config({
  name: 'SarapanCeriaPOS',
  version: 1.0,
  storeName: 'pos_data'
});

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create((set, get) => ({
  vendors: [],
  products: [],
  dailyRecords: {}, // { '2023-10-27': { date: '2023-10-27', records: [...] } }
  isOffline: !navigator.onLine,
  
  // Firebase status
  isFirebaseConfigured: false,
  isFirebaseConnected: false,
  firebaseSyncStatus: 'idle', // 'idle' | 'syncing' | 'connected' | 'error' | 'disconnected'
  firebaseError: null,
  firebaseConfigSource: null, // 'env' | 'settings' | null

  // Initialization
  initData: async () => {
    try {
      // 1. Muat data lokal terlebih dahulu untuk akses cepat & instan
      const vendors = await localforage.getItem('vendors') || [];
      const products = await localforage.getItem('products') || [];
      const dailyRecords = await localforage.getItem('dailyRecords') || {};
      
      set({ vendors, products, dailyRecords });

      // 2. Hubungkan ke Firebase untuk sinkronisasi multi-user otomatis
      await get().initFirebaseSync();
    } catch (error) {
      console.error("Failed to load local data or init sync", error);
    }
  },

  initFirebaseSync: async () => {
    const config = getActiveFirebaseConfig();
    if (!config) {
      set({
        isFirebaseConfigured: false,
        isFirebaseConnected: false,
        firebaseSyncStatus: 'disconnected',
        firebaseConfigSource: null
      });
      return false;
    }

    set({
      isFirebaseConfigured: true,
      firebaseConfigSource: config.source,
      firebaseSyncStatus: 'syncing',
      firebaseError: null
    });

    const initResult = initFirebase(config);
    if (!initResult.success) {
      set({
        isFirebaseConnected: false,
        firebaseSyncStatus: 'error',
        firebaseError: initResult.error?.message || 'Gagal inisialisasi Firebase'
      });
      return false;
    }

    // Subscribe realtime listeners
    try {
      // Realtime Vendors
      subscribeToVendors(
        async (remoteVendors) => {
          // Hanya update jika ada data dari remote
          if (remoteVendors && remoteVendors.length > 0) {
            set({ vendors: remoteVendors, isFirebaseConnected: true, firebaseSyncStatus: 'connected' });
            await localforage.setItem('vendors', remoteVendors);
          } else if (get().vendors.length > 0) {
            // Jika remote masih kosong tapi lokal ada data, tetap pertahankan data lokal
            set({ isFirebaseConnected: true, firebaseSyncStatus: 'connected' });
          } else {
            set({ vendors: [], isFirebaseConnected: true, firebaseSyncStatus: 'connected' });
          }
        },
        (error) => {
          console.warn("Vendors sync error:", error);
          set({ firebaseSyncStatus: 'error', firebaseError: error.message });
        }
      );

      // Realtime Products
      subscribeToProducts(
        async (remoteProducts) => {
          if (remoteProducts && remoteProducts.length > 0) {
            set({ products: remoteProducts, isFirebaseConnected: true, firebaseSyncStatus: 'connected' });
            await localforage.setItem('products', remoteProducts);
          } else if (get().products.length > 0) {
            set({ isFirebaseConnected: true, firebaseSyncStatus: 'connected' });
          } else {
            set({ products: [], isFirebaseConnected: true, firebaseSyncStatus: 'connected' });
          }
        },
        (error) => {
          console.warn("Products sync error:", error);
          set({ firebaseSyncStatus: 'error', firebaseError: error.message });
        }
      );

      // Realtime Daily Records
      subscribeToDailyRecords(
        async (remoteRecords) => {
          if (remoteRecords && Object.keys(remoteRecords).length > 0) {
            set((state) => {
              const merged = { ...state.dailyRecords, ...remoteRecords };
              localforage.setItem('dailyRecords', merged);
              return { dailyRecords: merged, isFirebaseConnected: true, firebaseSyncStatus: 'connected' };
            });
          } else {
            set({ isFirebaseConnected: true, firebaseSyncStatus: 'connected' });
          }
        },
        (error) => {
          console.warn("DailyRecords sync error:", error);
          set({ firebaseSyncStatus: 'error', firebaseError: error.message });
        }
      );

      set({ isFirebaseConnected: true, firebaseSyncStatus: 'connected' });
      return true;
    } catch (err) {
      console.error("Error setting up Firebase subscriptions:", err);
      set({
        isFirebaseConnected: false,
        firebaseSyncStatus: 'error',
        firebaseError: err.message
      });
      return false;
    }
  },

  // Konfigurasi manual dari halaman Pengaturan
  saveCustomFirebaseConfig: async (config) => {
    saveFirebaseConfigToStorage(config);
    return await get().initFirebaseSync();
  },

  removeFirebaseConfig: () => {
    stopFirebaseSync();
    saveFirebaseConfigToStorage(null);
    set({
      isFirebaseConfigured: false,
      isFirebaseConnected: false,
      firebaseSyncStatus: 'disconnected',
      firebaseConfigSource: null,
      firebaseError: null
    });
  },

  // Unggah semua data lokal ke cloud Firestore
  uploadLocalDataToFirebase: async () => {
    const { vendors, products, dailyRecords } = get();
    await uploadAllLocalDataToCloud({ vendors, products, dailyRecords });
  },

  setOfflineStatus: (status) => set({ isOffline: status }),

  // --- Vendors ---
  addVendor: async (vendor) => {
    const newVendor = { ...vendor, id: generateId(), createdAt: new Date().toISOString() };
    const vendors = [...get().vendors, newVendor];
    set({ vendors });
    await localforage.setItem('vendors', vendors);

    // Otomatis sinkron ke Firebase
    if (get().isFirebaseConfigured) {
      syncVendorToCloud(newVendor).catch(err => console.error("Sync vendor error:", err));
    }
  },
  
  updateVendor: async (id, updatedData) => {
    const vendors = get().vendors.map(v => v.id === id ? { ...v, ...updatedData } : v);
    set({ vendors });
    await localforage.setItem('vendors', vendors);

    const updatedVendor = vendors.find(v => v.id === id);
    if (get().isFirebaseConfigured && updatedVendor) {
      syncVendorToCloud(updatedVendor).catch(err => console.error("Sync vendor update error:", err));
    }
  },

  deleteVendor: async (id) => {
    const vendors = get().vendors.filter(v => v.id !== id);
    set({ vendors });
    await localforage.setItem('vendors', vendors);

    if (get().isFirebaseConfigured) {
      deleteVendorFromCloud(id).catch(err => console.error("Sync vendor delete error:", err));
    }
  },

  // --- Products ---
  addProduct: async (product) => {
    const newProduct = { ...product, id: generateId(), createdAt: new Date().toISOString() };
    const products = [...get().products, newProduct];
    set({ products });
    await localforage.setItem('products', products);

    if (get().isFirebaseConfigured) {
      syncProductToCloud(newProduct).catch(err => console.error("Sync product error:", err));
    }
    return newProduct.id;
  },

  updateProduct: async (id, updatedData) => {
    const products = get().products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    set({ products });
    await localforage.setItem('products', products);

    const updatedProduct = products.find(p => p.id === id);
    if (get().isFirebaseConfigured && updatedProduct) {
      syncProductToCloud(updatedProduct).catch(err => console.error("Sync product update error:", err));
    }
  },

  deleteProduct: async (id) => {
    const products = get().products.filter(p => p.id !== id);
    set({ products });
    await localforage.setItem('products', products);

    if (get().isFirebaseConfigured) {
      deleteProductFromCloud(id).catch(err => console.error("Sync product delete error:", err));
    }
  },

  // --- Daily Records ---
  addDailyVendorRecord: async (date, vendorId) => {
    const dailyRecords = { ...get().dailyRecords };
    if (!dailyRecords[date]) {
      dailyRecords[date] = { date, records: [] };
    }
    
    // Check if vendor already exists for today
    if (!dailyRecords[date].records.find(r => r.vendorId === vendorId)) {
      
      const vendorProducts = get().products.filter(p => p.vendorId === vendorId);
      const initialItems = vendorProducts.map(p => ({
        productId: p.id,
        productName: p.name,
        basePrice: p.basePrice || 0,
        salePrice: p.salePrice || 0,
        qtyTitip: 0,
        qtySold: 0
      }));

      // Start with 1 empty row if no products are linked yet
      if (initialItems.length === 0) {
        initialItems.push({
          productId: '',
          productName: '',
          basePrice: 0,
          salePrice: 0,
          qtyTitip: 0,
          qtySold: 0
        });
      }

      dailyRecords[date] = {
        ...dailyRecords[date],
        records: [
          ...dailyRecords[date].records,
          {
            id: generateId(),
            vendorId,
            note: '',
            items: initialItems
          }
        ]
      };
      set({ dailyRecords });
      await localforage.setItem('dailyRecords', dailyRecords);

      if (get().isFirebaseConfigured) {
        syncDailyRecordToCloud(date, dailyRecords[date]).catch(err => console.error("Sync daily record error:", err));
      }
    }
  },

  updateDailyRecordNote: async (date, recordId, note) => {
    const dailyRecords = { ...get().dailyRecords };
    if (dailyRecords[date]) {
      const newRecords = dailyRecords[date].records.map(r => 
        r.id === recordId ? { ...r, note } : r
      );
      dailyRecords[date] = { ...dailyRecords[date], records: newRecords };
      set({ dailyRecords });
      await localforage.setItem('dailyRecords', dailyRecords);

      if (get().isFirebaseConfigured) {
        syncDailyRecordToCloud(date, dailyRecords[date]).catch(err => console.error("Sync daily record note error:", err));
      }
    }
  },

  updateDailyItem: async (date, recordId, itemIndex, itemData) => {
    const dailyRecords = { ...get().dailyRecords };
    if (dailyRecords[date]) {
      const newRecords = dailyRecords[date].records.map(r => {
        if (r.id === recordId) {
          const newItems = [...r.items];
          if (itemIndex >= newItems.length) {
            newItems.push(itemData);
          } else {
            newItems[itemIndex] = { ...newItems[itemIndex], ...itemData };
          }
          return { ...r, items: newItems };
        }
        return r;
      });
      dailyRecords[date] = { ...dailyRecords[date], records: newRecords };
      set({ dailyRecords });
      await localforage.setItem('dailyRecords', dailyRecords);

      if (get().isFirebaseConfigured) {
        syncDailyRecordToCloud(date, dailyRecords[date]).catch(err => console.error("Sync daily item error:", err));
      }
    }
  },

  addEmptyItemToRecord: async (date, recordId) => {
    const dailyRecords = { ...get().dailyRecords };
    if (dailyRecords[date]) {
      const newRecords = dailyRecords[date].records.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            items: [
              ...r.items,
              {
                productId: '',
                productName: '',
                basePrice: 0,
                salePrice: 0,
                qtyTitip: 0,
                qtySold: 0
              }
            ]
          };
        }
        return r;
      });
      dailyRecords[date] = { ...dailyRecords[date], records: newRecords };
      set({ dailyRecords });
      await localforage.setItem('dailyRecords', dailyRecords);

      if (get().isFirebaseConfigured) {
        syncDailyRecordToCloud(date, dailyRecords[date]).catch(err => console.error("Sync add empty item error:", err));
      }
    }
  },
  
  deleteDailyItem: async (date, recordId, itemIndex) => {
    const dailyRecords = { ...get().dailyRecords };
    if (dailyRecords[date]) {
      const newRecords = dailyRecords[date].records.map(r => {
        if (r.id === recordId) {
          return { ...r, items: r.items.filter((_, idx) => idx !== itemIndex) };
        }
        return r;
      });
      dailyRecords[date] = { ...dailyRecords[date], records: newRecords };
      set({ dailyRecords });
      await localforage.setItem('dailyRecords', dailyRecords);

      if (get().isFirebaseConfigured) {
        syncDailyRecordToCloud(date, dailyRecords[date]).catch(err => console.error("Sync delete daily item error:", err));
      }
    }
  },

  deleteDailyRecord: async (date, recordId) => {
    const dailyRecords = { ...get().dailyRecords };
    if (dailyRecords[date]) {
      dailyRecords[date] = {
        ...dailyRecords[date],
        records: dailyRecords[date].records.filter(r => r.id !== recordId)
      };
      set({ dailyRecords });
      await localforage.setItem('dailyRecords', dailyRecords);

      if (get().isFirebaseConfigured) {
        syncDailyRecordToCloud(date, dailyRecords[date]).catch(err => console.error("Sync delete record error:", err));
      }
    }
  },

  toggleDailyRecordHandedOver: async (date, recordId) => {
    const dailyRecords = { ...get().dailyRecords };
    if (dailyRecords[date]) {
      const newRecords = dailyRecords[date].records.map(r => 
        r.id === recordId ? { ...r, isHandedOver: !r.isHandedOver } : r
      );
      dailyRecords[date] = { ...dailyRecords[date], records: newRecords };
      set({ dailyRecords });
      await localforage.setItem('dailyRecords', dailyRecords);

      if (get().isFirebaseConfigured) {
        syncDailyRecordToCloud(date, dailyRecords[date]).catch(err => console.error("Sync toggle handover error:", err));
      }
    }
  },

  updateEntireDailyRecord: async (date, updatedDayRecord) => {
    const dailyRecords = { ...get().dailyRecords };
    if (dailyRecords[date]) {
      dailyRecords[date] = updatedDayRecord;
      set({ dailyRecords });
      await localforage.setItem('dailyRecords', dailyRecords);

      if (get().isFirebaseConfigured) {
        syncDailyRecordToCloud(date, updatedDayRecord).catch(err => console.error("Sync entire record error:", err));
      }
    }
  }
}));

// Sync helper compatible with old callers
export const syncWithServer = async () => {
  const store = useStore.getState();
  if (store.isFirebaseConfigured) {
    await store.uploadLocalDataToFirebase();
  }
};
