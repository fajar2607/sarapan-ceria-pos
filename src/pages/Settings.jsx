import { useState } from 'react';
import { 
  Save, 
  RefreshCw, 
  Trash2, 
  ShieldAlert, 
  Cloud, 
  CloudOff, 
  AlertTriangle, 
  UploadCloud, 
  FileCode 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getActiveFirebaseConfig } from '../services/firebase';
import localforage from 'localforage';

const Settings = () => {
  const { 
    isOffline, 
    initData,
    isFirebaseConfigured, 
    isFirebaseConnected, 
    firebaseError, 
    firebaseConfigSource,
    saveCustomFirebaseConfig, 
    removeFirebaseConfig,
    uploadLocalDataToFirebase,
    vendors,
    products,
    dailyRecords
  } = useStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncMessageType, setSyncMessageType] = useState('info'); // 'info' | 'success' | 'error'

  // Input states
  const [inputMode, setInputMode] = useState('json'); // 'json' | 'manual'
  
  const [jsonConfigInput, setJsonConfigInput] = useState(() => {
    const active = getActiveFirebaseConfig();
    if (active) {
      return JSON.stringify({
        apiKey: active.apiKey,
        authDomain: active.authDomain,
        projectId: active.projectId,
        storageBucket: active.storageBucket,
        messagingSenderId: active.messagingSenderId,
        appId: active.appId
      }, null, 2);
    }
    return '';
  });

  const [formConfig, setFormConfig] = useState(() => {
    const active = getActiveFirebaseConfig();
    return {
      apiKey: active?.apiKey || '',
      authDomain: active?.authDomain || '',
      projectId: active?.projectId || '',
      storageBucket: active?.storageBucket || '',
      messagingSenderId: active?.messagingSenderId || '',
      appId: active?.appId || ''
    };
  });

  const showNotification = (msg, type = 'info') => {
    setSyncMessage(msg);
    setSyncMessageType(type);
    setTimeout(() => {
      setSyncMessage('');
    }, 5000);
  };

  const handleParseAndSaveJson = async () => {
    try {
      let parsed = null;
      // Handle snippet like: const firebaseConfig = { ... };
      const cleaned = jsonConfigInput
        .replace(/^[^{]*/, '') // buang sebelum {
        .replace(/[^}]*$/, ''); // buang setelah }

      // Ganti key tanpa kutip agar valid JSON jika berupa object literal JS
      const validJsonString = cleaned
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/'/g, '"');

      try {
        parsed = JSON.parse(validJsonString);
      } catch {
        // Fallback coba eval sederhana jika parser JSON gagal
        const func = new Function(`return ${cleaned}`);
        parsed = func();
      }

      if (!parsed || !parsed.apiKey || !parsed.projectId) {
        throw new Error("Format konfigurasi tidak valid. Pastikan berisi minimal 'apiKey' dan 'projectId'.");
      }

      setIsSyncing(true);
      const success = await saveCustomFirebaseConfig(parsed);
      setIsSyncing(false);

      if (success) {
        showNotification("Konfigurasi Firebase berhasil disimpan dan terhubung!", "success");
      } else {
        showNotification("Gagal menghubungkan ke Firebase. Periksa kembali kunci konfigurasi dan aturan Firestore Anda.", "error");
      }
    } catch (err) {
      setIsSyncing(false);
      showNotification(`Gagal memproses konfigurasi: ${err.message}`, "error");
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!formConfig.apiKey || !formConfig.projectId) {
      showNotification("Kolom API Key dan Project ID wajib diisi.", "error");
      return;
    }

    setIsSyncing(true);
    const success = await saveCustomFirebaseConfig(formConfig);
    setIsSyncing(false);

    if (success) {
      showNotification("Konfigurasi Firebase berhasil disimpan dan terhubung!", "success");
    } else {
      showNotification("Gagal menghubungkan ke Firebase. Periksa kembali kunci konfigurasi.", "error");
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("Apakah Anda ingin memutuskan koneksi Firebase? Aplikasi akan kembali menggunakan penyimpanan lokal saja.")) {
      removeFirebaseConfig();
      showNotification("Koneksi Firebase dinonaktifkan.", "info");
    }
  };

  const handleUploadAllToCloud = async () => {
    if (!isFirebaseConnected) {
      showNotification("Tidak dapat mengunggah. Firebase belum terhubung.", "error");
      return;
    }

    const totalDays = Object.keys(dailyRecords).length;
    const confirmMsg = `Unggah seluruh data lokal saat ini ke Cloud Firebase?\n\n- ${vendors.length} Vendor\n- ${products.length} Produk\n- ${totalDays} Hari Catatan Penjualan\n\nData ini akan otomatis tersedia untuk semua perangkat pengguna lainnya.`;
    
    if (window.confirm(confirmMsg)) {
      setIsSyncing(true);
      try {
        await uploadLocalDataToFirebase();
        showNotification("Semua data lokal berhasil disinkronkan ke Cloud Firebase!", "success");
      } catch (err) {
        console.error(err);
        showNotification(`Gagal mengunggah data: ${err.message}`, "error");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleClearData = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA data lokal di perangkat ini? Tindakan ini tidak dapat dibatalkan.")) {
      await localforage.clear();
      await initData();
      alert("Data lokal berhasil dihapus.");
    }
  };

  return (
    <div style={{ maxWidth: 840, paddingBottom: 40 }}>
      {/* Status Card */}
      <div className="table-container" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 className="header-title" style={{ fontSize: '1.25rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              {isFirebaseConnected ? (
                <>
                  <Cloud size={24} className="text-success" />
                  <span>Sinkronisasi Multi-User Aktif</span>
                </>
              ) : isFirebaseConfigured ? (
                <>
                  <RefreshCw size={24} className="text-warning animate-spin" />
                  <span>Menghubungkan ke Firebase...</span>
                </>
              ) : (
                <>
                  <CloudOff size={24} className="text-muted" />
                  <span>Mode Penyimpanan Lokal Saja</span>
                </>
              )}
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>
              {isFirebaseConnected 
                ? 'Aplikasi Anda otomatis tersinkronisasi secara real-time antar semua perangkat tanpa perlu login.'
                : 'Belum terhubung ke backend Firebase. Data saat ini hanya tersimpan di perangkat ini.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFirebaseConnected && (
              <span className="badge" style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>
                ● Real-Time Online
              </span>
            )}
            {firebaseConfigSource && (
              <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem' }}>
                Sumber: {firebaseConfigSource === 'env' ? 'File .env' : 'Menu Pengaturan'}
              </span>
            )}
          </div>
        </div>

        {firebaseError && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fee2e2', borderRadius: 'var(--radius)', border: '1px solid #f87171', color: '#991b1b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} />
            <div>
              <strong>Kendala Koneksi:</strong> {firebaseError}
            </div>
          </div>
        )}

        {syncMessage && (
          <div style={{ 
            marginTop: 16, 
            padding: '12px 16px', 
            borderRadius: 'var(--radius)', 
            fontSize: '0.9rem',
            background: syncMessageType === 'success' ? '#dcfce7' : syncMessageType === 'error' ? '#fee2e2' : '#e0f2fe',
            color: syncMessageType === 'success' ? '#166534' : syncMessageType === 'error' ? '#991b1b' : '#0369a1',
            border: `1px solid ${syncMessageType === 'success' ? '#86efac' : syncMessageType === 'error' ? '#fca5a5' : '#7dd3fc'}`
          }}>
            {syncMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {isFirebaseConnected && (
            <button 
              className="btn btn-primary" 
              onClick={handleUploadAllToCloud}
              disabled={isSyncing || isOffline}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <UploadCloud size={18} />
              {isSyncing ? 'Mengunggah...' : 'Unggah Data Lokal ke Cloud'}
            </button>
          )}

          {isFirebaseConfigured && firebaseConfigSource === 'settings' && (
            <button 
              className="btn btn-outline" 
              onClick={handleDisconnect}
              style={{ borderColor: 'var(--border)' }}
            >
              Putuskan Koneksi Firebase
            </button>
          )}
        </div>
      </div>

      {/* Backend / Firebase Configuration Card */}
      <div className="table-container" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 className="header-title" style={{ fontSize: '1.25rem', marginBottom: 4 }}>
              Pengaturan Backend Firebase
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              Masukkan konfigurasi Firebase agar kasir dan admin di perangkat berbeda dapat melihat data yang sama secara langsung.
            </p>
          </div>

          <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius)', padding: 4 }}>
            <button
              type="button"
              className={`btn btn-sm ${inputMode === 'json' ? 'btn-primary' : ''}`}
              style={{ background: inputMode === 'json' ? 'var(--primary)' : 'transparent', color: inputMode === 'json' ? '#fff' : 'var(--text)', border: 'none', padding: '6px 12px' }}
              onClick={() => setInputMode('json')}
            >
              <FileCode size={14} style={{ marginRight: 6, display: 'inline' }} />
              Tempel Objek JSON
            </button>
            <button
              type="button"
              className={`btn btn-sm ${inputMode === 'manual' ? 'btn-primary' : ''}`}
              style={{ background: inputMode === 'manual' ? 'var(--primary)' : 'transparent', color: inputMode === 'manual' ? '#fff' : 'var(--text)', border: 'none', padding: '6px 12px' }}
              onClick={() => setInputMode('manual')}
            >
              Formulir Input
            </button>
          </div>
        </div>

        {/* Input Mode: JSON */}
        {inputMode === 'json' ? (
          <div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Tips Cepat:</strong> Buka <em>Firebase Console &gt; Project Settings &gt; General &gt; Your apps (Web app)</em>, lalu salin seluruh isi <code>const firebaseConfig = &#123; ... &#125;;</code> dan tempelkan di kotak bawah ini:
            </div>
            <textarea
              className="form-control"
              rows={8}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "sarapan-ceria-pos.firebaseapp.com",\n  "projectId": "sarapan-ceria-pos",\n  "storageBucket": "sarapan-ceria-pos.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
              value={jsonConfigInput}
              onChange={(e) => setJsonConfigInput(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleParseAndSaveJson}
              disabled={isSyncing || !jsonConfigInput.trim()}
              style={{ marginTop: 14 }}
            >
              <Save size={18} style={{ marginRight: 8 }} />
              Simpan &amp; Hubungkan Firebase
            </button>
          </div>
        ) : (
          /* Input Mode: Manual Form */
          <form onSubmit={handleSaveManual}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label className="form-label">Project ID <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="sarapan-ceria-pos"
                  value={formConfig.projectId}
                  onChange={(e) => setFormConfig({ ...formConfig, projectId: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">API Key <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="AIzaSy..."
                  value={formConfig.apiKey}
                  onChange={(e) => setFormConfig({ ...formConfig, apiKey: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Auth Domain</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="sarapan-ceria-pos.firebaseapp.com"
                  value={formConfig.authDomain}
                  onChange={(e) => setFormConfig({ ...formConfig, authDomain: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Storage Bucket</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="sarapan-ceria-pos.appspot.com"
                  value={formConfig.storageBucket}
                  onChange={(e) => setFormConfig({ ...formConfig, storageBucket: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Messaging Sender ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="123456789012"
                  value={formConfig.messagingSenderId}
                  onChange={(e) => setFormConfig({ ...formConfig, messagingSenderId: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">App ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="1:123456789012:web:abcdef"
                  value={formConfig.appId}
                  onChange={(e) => setFormConfig({ ...formConfig, appId: e.target.value })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSyncing}
              style={{ marginTop: 20 }}
            >
              <Save size={18} style={{ marginRight: 8 }} />
              Simpan &amp; Hubungkan Firebase
            </button>
          </form>
        )}
      </div>

      {/* Dangerous Zone */}
      <div className="table-container" style={{ padding: 24, border: '1px solid var(--danger)' }}>
        <h3 className="header-title text-danger" style={{ fontSize: '1.25rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={20} /> Zona Berbahaya
        </h3>
        <p className="text-muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
          Tindakan di bawah ini akan menghapus data pada penyimpanan browser lokal di perangkat ini.
        </p>
        
        <button className="btn btn-danger" onClick={handleClearData}>
          <Trash2 size={18} style={{ marginRight: 8 }} /> Hapus Semua Data Lokal di Perangkat Ini
        </button>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Settings;
